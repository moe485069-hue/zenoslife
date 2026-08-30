import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Users, Globe, Copy, Check, Share2, Sparkles, X, 
  ArrowRight, Shield, Swords, Flame, RotateCw, Trophy, Radio
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import useAppStore from '../../store/appStore';

export default function GameMatchSetupModal({ isOpen, onClose, game, onStartGame }) {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [selectedMode, setSelectedMode] = useState('bot'); // 'bot' | 'local' | 'online'
  const [botDifficulty, setBotDifficulty] = useState('medium'); // 'easy' | 'medium' | 'master'
  const [playerCount, setPlayerCount] = useState(2); // 2, 3, 4
  const [matchSets, setMatchSets] = useState(3); // 1, 3, 5, 7
  
  // Online state
  const [onlineTab, setOnlineTab] = useState('quick'); // 'quick' | 'create' | 'join'
  const [roomCode, setRoomCode] = useState(() => 'ZEN-' + Math.floor(1000 + Math.random() * 9000));
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRoomCode('ZEN-' + Math.floor(1000 + Math.random() * 9000));
      setCopied(false);
      setIsSearching(false);
    }
  }, [isOpen, game?.id]);

  if (!isOpen || !game) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareableUrl = `${originUrl}${game.path}?room=${roomCode}&mode=online`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareableUrl);
    setCopied(true);
    soundEngine.playCheckmark?.();
    haptics.success?.();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `بازی آنلاین ${isRtl ? game.titleFa : game.titleEn} در زنوسلایف`,
          text: `بیا با هم ${isRtl ? game.titleFa : game.titleEn} بازی کنیم! وارد لینک شو:`,
          url: shareableUrl
        });
      } catch (_) {}
    } else {
      handleCopyLink();
    }
  };

  const handleStart = () => {
    soundEngine.playLevelUp?.();
    haptics.success?.();

    if (selectedMode === 'online') {
      const activeCode = onlineTab === 'join' && joinCodeInput.trim() ? joinCodeInput.trim().toUpperCase() : roomCode;
      onStartGame?.({
        mode: 'online',
        botDifficulty,
        roomCode: activeCode,
        isHost: onlineTab !== 'join',
        playerCount,
        matchSets
      });
    } else {
      onStartGame?.({
        mode: selectedMode,
        botDifficulty,
        roomCode: null,
        isHost: true,
        playerCount,
        matchSets
      });
    }
  };

  const handleQuickMatch = () => {
    setIsSearching(true);
    soundEngine.playTap?.();
    haptics.tap?.();
    setTimeout(() => {
      setIsSearching(false);
      handleStart();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="glass-card w-full max-w-md p-5 sm:p-6 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-900/95 via-black/95 to-slate-950/95 text-start space-y-4 shadow-2xl relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-md">
              {game.icon}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-200">
                {isRtl ? game.titleFa : game.titleEn}
              </h2>
              <span className="text-[11px] text-slate-300 font-bold">
                {isRtl ? 'انتخاب حالت بازی و حریف' : 'Select Game Mode & Opponent'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Main Mode Selectors */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {[
            { id: 'bot', nameFa: 'با ربات هوشمند', nameEn: 'Vs Bot AI', icon: Bot, badge: 'تک‌نفره' },
            { id: 'local', nameFa: 'دونفره یک دستگاه', nameEn: 'Pass & Play', badge: 'همین گوشی' },
            { id: 'online', nameFa: 'آنلاین با کاربران', nameEn: 'Online Match', icon: Globe, badge: 'چندنفره' }
          ].map(m => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMode(m.id);
                  soundEngine.playTap?.();
                  haptics.tap?.();
                }}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500/25 to-yellow-500/15 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.03]'
                    : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {m.icon ? <m.icon size={20} className={isSelected ? 'text-amber-300' : 'text-slate-400'} /> : <Users size={20} className={isSelected ? 'text-amber-300' : 'text-slate-400'} />}
                <span className="text-xs font-black leading-tight">
                  {isRtl ? m.nameFa : m.nameEn}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/40 text-slate-400 font-mono">
                  {isRtl ? m.badge : m.id}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Mode Details */}
        <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 relative z-10">
          
          {/* 1. BOT SETTINGS */}
          {selectedMode === 'bot' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {isRtl ? 'سطح هوش مصنوعی ربات:' : 'AI Difficulty:'}
                </span>
                <span className="text-xs font-black text-amber-300">
                  {botDifficulty === 'easy' ? (isRtl ? 'آسان 🟢' : 'Easy') : botDifficulty === 'medium' ? (isRtl ? 'متوسط 🟡' : 'Medium') : (isRtl ? 'استاد بزرگ 🔴' : 'Master')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'easy', fa: 'مبتدی', en: 'Easy' },
                  { id: 'medium', fa: 'متوسط', en: 'Medium' },
                  { id: 'master', fa: 'استاد', en: 'Master' }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setBotDifficulty(d.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                      botDifficulty === d.id
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-xs'
                        : 'bg-black/30 border-white/10 text-slate-400'
                    }`}
                  >
                    {isRtl ? d.fa : d.en}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isRtl ? 'ربات بدون اتلاف وقت بلافاصله در نوبت خود بازی می‌کند و تمرین بسیار خوبی برای سنجش مهارت شماست.' : 'AI plays instantly and provides great skill training.'}
              </p>
            </div>
          )}

          {/* 2. LOCAL PASS & PLAY SETTINGS */}
          {selectedMode === 'local' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  {isRtl ? 'حالت بازی دورهمی:' : 'Local Setup:'}
                </span>
                <span className="text-xs font-black text-amber-300">
                  {game.id === 'ludo' ? `${playerCount} نفره` : 'دونفره نوبتی'}
                </span>
              </div>

              {game.id === 'ludo' && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400">{isRtl ? 'تعداد بازیکنان منچ:' : 'Number of Players:'}</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setPlayerCount(num)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          playerCount === num
                            ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                            : 'bg-black/30 border-white/10 text-slate-400'
                        }`}
                      >
                        {num} {isRtl ? 'بازیکن' : 'Players'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {game.id === 'backgammon' && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400">{isRtl ? 'تعداد ست‌های مسابقه تخته نرد:' : 'Match Sets:'}</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 3, 5, 7].map(s => (
                      <button
                        key={s}
                        onClick={() => setMatchSets(s)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          matchSets === s
                            ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                            : 'bg-black/30 border-white/10 text-slate-400'
                        }`}
                      >
                        {s} {isRtl ? 'ست' : 'Sets'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isRtl ? 'هر دو بازیکن روی همین گوشی یا لپ‌تاپ به نوبت بازی می‌کنند. چت روم در این حالت غیرفعال است.' : 'Both players take turns on the same device.'}
              </p>
            </div>
          )}

          {/* 3. ONLINE MULTIPLAYER SETTINGS */}
          {selectedMode === 'online' && (
            <div className="space-y-3">
              {/* Sub-tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-bold">
                <button
                  onClick={() => setOnlineTab('quick')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    onlineTab === 'quick' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  {isRtl ? 'جستجوی آنلاین 🔍' : 'Matchmaking'}
                </button>
                <button
                  onClick={() => setOnlineTab('create')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    onlineTab === 'create' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  {isRtl ? 'ساخت لینک 🔗' : 'Invite Link'}
                </button>
                <button
                  onClick={() => setOnlineTab('join')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    onlineTab === 'join' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
                  }`}
                >
                  {isRtl ? 'کد اتاق 🔑' : 'Join Code'}
                </button>
              </div>

              {/* Sub-tab 1: Quick Matchmaking */}
              {onlineTab === 'quick' && (
                <div className="text-center py-2 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                    <Radio size={24} className={isSearching ? 'animate-pulse' : ''} />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    {isSearching
                      ? (isRtl ? 'در حال جستجوی حریف آنلاین در شبکه زنوسلایف...' : 'Searching for online opponent...')
                      : (isRtl ? 'اتصال خودکار به اولین کاربر آنلاینی که آماده بازی است.' : 'Instantly connect to any available player.')}
                  </p>
                </div>
              )}

              {/* Sub-tab 2: Create & Share Link */}
              {onlineTab === 'create' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">{isRtl ? 'کد اتاق شما:' : 'Room Code:'}</span>
                    <span className="font-mono font-black text-amber-300 text-sm px-2 py-0.5 rounded-md bg-black/60 border border-amber-500/40">
                      {roomCode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={shareableUrl}
                      className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-[10px] text-slate-300 font-mono truncate outline-none select-all"
                      dir="ltr"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                        copied ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/10 border-white/20 text-slate-200 hover:text-white'
                      }`}
                      title={isRtl ? 'کپی لینک' : 'Copy'}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={handleNativeShare}
                      className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:brightness-110"
                      title={isRtl ? 'اشتراک‌گذاری' : 'Share'}
                    >
                      <Share2 size={14} />
                    </button>
                  </div>

                  <span className="text-[10px] text-emerald-400 block font-bold">
                    💬 {isRtl ? 'قابلیت چت روم زنده و ارسال پیام در طول بازی آنلاین فعال خواهد بود.' : 'Live in-game chat is active in online mode.'}
                  </span>
                </div>
              )}

              {/* Sub-tab 3: Join by Code */}
              {onlineTab === 'join' && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-bold block">
                    {isRtl ? 'کد اتاق دوست خود را وارد کنید:' : 'Enter Room Code:'}
                  </span>
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="مثال: ZEN-8492"
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-500/40 text-center font-mono font-black text-amber-300 text-sm outline-none focus:ring-1 focus:ring-amber-400"
                    dir="ltr"
                  />
                </div>
              )}

            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 relative z-10">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
          >
            {isRtl ? 'انصراف' : 'Cancel'}
          </button>

          {selectedMode === 'online' && onlineTab === 'quick' ? (
            <button
              onClick={handleQuickMatch}
              disabled={isSearching}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isSearching ? <RotateCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
              <span>{isSearching ? (isRtl ? 'در حال جستجو...' : 'Searching...') : (isRtl ? 'جستجو و شروع بازی 🚀' : 'Find & Play 🚀')}</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>{isRtl ? 'شروع بازی 🎮' : 'Start Match 🎮'}</span>
              <ArrowRight size={15} className={isRtl ? 'rotate-180 text-slate-950' : 'text-slate-950'} />
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
}
