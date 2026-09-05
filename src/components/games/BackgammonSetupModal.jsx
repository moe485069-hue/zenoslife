import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Users, Globe, Send, Share2, Copy, Check, Sparkles, 
  X, RefreshCw, Trophy, Swords, Smartphone, ArrowRight
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function BackgammonSetupModal({ 
  isOpen, 
  onClose, 
  onStartGame,
  currentTheme = 'wood',
  onThemeChange
}) {
  const [activeTab, setActiveTab] = useState('telegram'); // 'telegram' | 'bot' | 'online' | 'local'
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [matchSets, setMatchSets] = useState(3);
  const [wager, setWager] = useState(0); // 0 (Free), 50, 100, 250, 500
  const [roomCode, setRoomCode] = useState(() => 'CHZ-' + Math.floor(1000 + Math.random() * 9000));
  const [targetUsername, setTargetUsername] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoomCode('CHZ-' + Math.floor(1000 + Math.random() * 9000));
      setCopied(false);
      setIsSearching(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Deep Link for Telegram Duel Challenge (uses ?start=room_ to guarantee it never errors)
  const botUsername = 'chazha_bot';
  const telegramDuelLink = `https://t.me/${botUsername}?start=room_${roomCode}`;
  const challengeMessage = `🪵 من تو رو به چالش تخته نرد در چاژا دعوت کردم! 🎲\nکد اتاق: ${roomCode}\nروی لینک زیر بزن و مستقیم وارد بازی شو: 👇\n${telegramDuelLink}`;

  const handleShareToTelegram = () => {
    soundEngine.playTap?.();
    haptics.tap?.();
    const text = `🎲 بیا تخته نرد با من بازی کن!\nکد اتاق: ${roomCode}\nروی لینک زیر بزن و مستقیم وارد بازی شو: 👇`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(telegramDuelLink)}&text=${encodeURIComponent(text)}`;
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
    // Auto-join host immediately into the game room!
    handleStart('telegram');
  };

  const handleInlineChallenge = () => {
    soundEngine.playTap?.();
    haptics.tap?.();
    handleShareToTelegram();
  };

  const handleSendToUser = (e) => {
    e.preventDefault();
    if (!targetUsername.trim()) return;
    soundEngine.playTap?.();
    haptics.tap?.();

    let cleanId = targetUsername.trim().replace('@', '');
    const userDirectUrl = `https://t.me/${cleanId}?text=${encodeURIComponent(challengeMessage)}`;
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(userDirectUrl);
    } else {
      window.open(userDirectUrl, '_blank');
    }
    // Auto-join host immediately into the game room!
    handleStart('telegram');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(telegramDuelLink);
    setCopied(true);
    soundEngine.playCheckmark?.();
    haptics.success?.();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStart = (mode) => {
    soundEngine.playLevelUp?.();
    haptics.success?.();
    const rawMode = mode || activeTab;
    const finalMode = (rawMode === 'telegram') ? 'online' : rawMode;
    onStartGame({
      mode: finalMode,
      botDifficulty,
      matchSets,
      wager,
      roomCode: (finalMode === 'online') ? roomCode : null
    });
    onClose();
  };

  const handleQuickMatch = () => {
    setIsSearching(true);
    soundEngine.playTap?.();
    haptics.tap?.();
    setTimeout(() => {
      setIsSearching(false);
      handleStart('online');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="w-full max-w-md rounded-3xl bg-slate-900/95 border border-amber-500/30 p-4 sm:p-5 shadow-2xl text-white relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <div>
              <h2 className="text-base font-black text-amber-300">
                شروع مسابقه تخته نرد
              </h2>
              <p className="text-[11px] text-slate-400">حالت بازی مورد نظرتان را انتخاب کنید</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Mode Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-2xl my-3 border border-white/5 text-[11px] font-bold">
          <button
            onClick={() => { setActiveTab('telegram'); soundEngine.playTap?.(); }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'telegram' ? 'bg-gradient-to-b from-sky-500 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send size={15} />
            <span>دعوت تلگرام</span>
          </button>

          <button
            onClick={() => { setActiveTab('bot'); soundEngine.playTap?.(); }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'bot' ? 'bg-gradient-to-b from-amber-500 to-yellow-600 text-black font-black shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot size={15} />
            <span>با ربات</span>
          </button>

          <button
            onClick={() => { setActiveTab('online'); soundEngine.playTap?.(); }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'online' ? 'bg-gradient-to-b from-purple-500 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords size={15} />
            <span>دوئل آنلاین</span>
          </button>

          <button
            onClick={() => { setActiveTab('local'); soundEngine.playTap?.(); }}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'local' ? 'bg-gradient-to-b from-emerald-500 to-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone size={15} />
            <span>دونفره حضوری</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-3 min-h-[220px]">
          
          {/* TAB 1: TELEGRAM DUEL CHALLENGE */}
          {activeTab === 'telegram' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-400" />
                    کد اختصاصی اتاق دوئل:
                  </span>
                  <span className="text-xs font-mono font-black text-amber-300 bg-black/50 px-2 py-0.5 rounded-lg border border-sky-400/30">
                    {roomCode}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  لینک چالش را برای هر کاربری در تلگرام بفرستید؛ با کلیک روی آن فوراً وارد بازی دونفره با شما می‌شود!
                </p>

                {/* Main Share Button */}
                <button
                  onClick={handleShareToTelegram}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 size={16} />
                  <span>ارسال چالش به دوستان یا گروه‌ها 🚀</span>
                </button>

                {/* Inline Card Share */}
                <button
                  onClick={handleInlineChallenge}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-sky-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  <span>ارسال کارت بازی تعاملی در چت ✨</span>
                </button>
              </div>

              {/* Direct Username Target */}
              <form onSubmit={handleSendToUser} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="آیدی تلگرام حریف (مثلاً @username)..."
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  dir="ltr"
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={!targetUsername.trim()}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-sky-300 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Send size={13} />
                  <span>ارسال</span>
                </button>
              </form>

              {/* Copy Direct Link */}
              <button
                onClick={handleCopyLink}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 font-bold flex items-center justify-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'لینک چالش کپی شد!' : 'کپی لینک مستقیم دعوت'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: SOLO VS BOT */}
          {activeTab === 'bot' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">درجه هوشمندی ربات:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'easy', label: 'مبتدی 🟢', desc: 'برای تمرین' },
                    { id: 'medium', label: 'متوسط 🟡', desc: 'رقابت نرمال' },
                    { id: 'master', label: 'استاد تخته 🔴', desc: 'حریف سرسخت' }
                  ].map(diff => (
                    <button
                      key={diff.id}
                      onClick={() => setBotDifficulty(diff.id)}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        botDifficulty === diff.id 
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md' 
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-black">{diff.label}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">{diff.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sets Target */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">تعداد دست‌های مسابقه:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map(sets => (
                    <button
                      key={sets}
                      onClick={() => setMatchSets(sets)}
                      className={`py-2 rounded-xl border text-xs font-black transition-all ${
                        matchSets === sets ? 'bg-amber-400 text-black border-amber-300 shadow-sm' : 'bg-black/30 border-white/5 text-slate-300'
                      }`}
                    >
                      {sets} دست {sets === 1 ? '(تک بازی)' : '(بهترین)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wager Chips */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">🪙 شرط‌بندی سکه برنده:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 0, label: 'بدون شرط' },
                    { val: 50, label: '۵۰ 🪙' },
                    { val: 100, label: '۱۰۰ 🪙' },
                    { val: 250, label: '۲۵۰ 🪙' }
                  ].map(w => (
                    <button
                      key={w.val}
                      onClick={() => setWager(w.val)}
                      className={`py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
                        wager === w.val ? 'bg-amber-400 text-black border-amber-300 font-black shadow-sm' : 'bg-black/30 border-white/5 text-slate-300 hover:text-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleStart('bot')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>شروع بازی با ربات هوشمند 🤖</span>
                <ArrowRight size={14} className="rotate-180" />
              </button>
            </div>
          )}

          {/* TAB 3: ONLINE QUICK MATCH */}
          {activeTab === 'online' && (
            <div className="space-y-3 text-center py-2">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <Swords size={32} className="mx-auto text-purple-400 animate-pulse" />
                <h3 className="text-xs font-black text-purple-200">دوئل آنلاین و پیدا کردن حریف تصادفی</h3>
                <p className="text-[11px] text-slate-300">
                  سیستم شما را به اولین بازیکن آنلاین منتظر در شبکه چاژا متصل می‌کند.
                </p>
              </div>

              <button
                onClick={handleQuickMatch}
                disabled={isSearching}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>در حال جستجوی بازیکن آنلاین...</span>
                  </>
                ) : (
                  <>
                    <Swords size={15} />
                    <span>جستجوی سریع حریف آنلاین ⚔️</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 4: LOCAL PASS & PLAY */}
          {activeTab === 'local' && (
            <div className="space-y-3 text-center py-2">
              <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 space-y-2">
                <Smartphone size={32} className="mx-auto text-teal-400" />
                <h3 className="text-xs font-black text-teal-200">دو نفره روی یک گوشی (Pass & Play)</h3>
                <p className="text-[11px] text-slate-300">
                  گوشی را بین خودتان و دوست‌تان قرار دهید و نوبتی تاس بیندازید و مهره حرکت دهید!
                </p>
              </div>

              <button
                onClick={() => handleStart('local')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-xs shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
              >
                شروع بازی دونفره حضوری 📱
              </button>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span>کنسول بازی‌های چاژا 🎮</span>
          <button
            onClick={() => handleStart(activeTab)}
            className="text-amber-400 font-bold hover:underline"
          >
            ورود مستقیم به تخته ⬅️
          </button>
        </div>

      </motion.div>
    </div>
  );
}
