import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Swords, Clock, Star, ShieldCheck, Play, Sparkles, Eye, Flame, Crown } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export const TOURNAMENTS_LIST = [
  {
    id: 'tour_hokm',
    titleFa: 'جام طلایی حکم ۴ نفره',
    titleEn: 'Royal Hokm Gold Cup',
    gameType: 'hokm',
    icon: '👑',
    entryFee: 100,
    prizePool: 5000,
    playersJoined: 28,
    maxPlayers: 32,
    startsInFa: '۱۵ دقیقه دیگر',
    startsInEn: 'In 15 mins',
    color: 'from-amber-600/30 to-yellow-900/40 border-amber-400/50'
  },
  {
    id: 'tour_backgammon',
    titleFa: 'لیگ استادان تخته‌نرد ایران',
    titleEn: 'Grandmaster Backgammon League',
    gameType: 'backgammon',
    icon: '🎲',
    entryFee: 200,
    prizePool: 10000,
    playersJoined: 14,
    maxPlayers: 16,
    startsInFa: '۴۰ دقیقه دیگر',
    startsInEn: 'In 40 mins',
    color: 'from-rose-600/30 to-amber-900/40 border-rose-400/50'
  },
  {
    id: 'tour_snooker',
    titleFa: 'جام بریک طلایی اسنوکر',
    titleEn: 'Golden Break Snooker Cup',
    gameType: 'snooker',
    icon: '🎱',
    entryFee: 150,
    prizePool: 7500,
    playersJoined: 12,
    maxPlayers: 16,
    startsInFa: '۵۵ دقیقه دیگر',
    startsInEn: 'In 55 mins',
    color: 'from-emerald-600/30 to-teal-900/40 border-emerald-400/50'
  }
];

const MOCK_BRACKET = {
  quarterFinals: [
    { p1: { name: 'آرشام_تاس‌باز', score: 3, won: true }, p2: { name: 'سام_سرعتی', score: 1, won: false } },
    { p1: { name: 'مهرداد_شاه', score: 2, won: false }, p2: { name: 'امیر_بریک', score: 3, won: true } },
    { p1: { name: 'نگین_تک‌خال', score: 3, won: true }, p2: { name: 'رضا_سایبر', score: 0, won: false } },
    { p1: { name: 'کوروش_کبیر', score: 3, won: true }, p2: { name: 'سهراب_تاس', score: 2, won: false } }
  ],
  semiFinals: [
    { p1: { name: 'آرشام_تاس‌باز', score: 5, won: true }, p2: { name: 'امیر_بریک', score: 4, won: false } },
    { p1: { name: 'نگین_تک‌خال', score: 5, won: true }, p2: { name: 'کوروش_کبیر', score: 2, won: false } }
  ],
  finalMatch: {
    p1: { name: 'آرشام_تاس‌باز', score: 4, isLeading: true },
    p2: { name: 'نگین_تک‌خال', score: 3, isLeading: false },
    statusFa: 'در حال برگزاری زنده (دست نهایی)'
  }
};

const LIVE_SPECTATOR_MATCHES = [
  {
    id: 'spec_1',
    gameTitle: 'فینال جام تخته نرد',
    gameIcon: '🎲',
    p1: { name: 'آرشام_تاس‌باز', avatar: '🦁', score: 4 },
    p2: { name: 'نگین_تک‌خال', avatar: '💎', score: 3 },
    viewers: 64,
    status: 'دست سرنوشت‌ساز پایانی'
  },
  {
    id: 'spec_2',
    gameTitle: 'نیمه‌نهایی اسنوکر ۳بعدی',
    gameIcon: '🎱',
    p1: { name: 'استاد_بریک', avatar: '🎱', score: 2 },
    p2: { name: 'سام_سرعتی', avatar: '⚡', score: 2 },
    viewers: 41,
    status: 'توپ مشکی تعیین‌کننده'
  }
];

export default function TournamentHubModal({ isOpen, onClose }) {
  const { coins, spendCoins, language } = useAppStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('tours'); // 'tours' | 'bracket' | 'spectator'
  const [joinedTours, setJoinedTours] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [spectatingMatch, setSpectatingMatch] = useState(null);
  const [cheerCount, setCheerCount] = useState(0);

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      const tonight = new Date();
      tonight.setHours(21, 0, 0, 0);
      if (now > tonight) tonight.setDate(tonight.getDate() + 1);
      const diff = tonight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (t) => {
    if (joinedTours.includes(t.id)) return;
    if (spendCoins(t.entryFee)) {
      setJoinedTours([...joinedTours, t.id]);
      soundEngine.playLevelUp?.();
      haptics.notification?.('success');
      alert(isRtl 
        ? `🎉 شما با موفقیت در «${t.titleFa}» ثبت‌نام شدید! به محض شروع به میز هدایت می‌شوید.` 
        : `🎉 Successfully joined ${t.titleEn}! You will be escorted to table when match begins.`);
    } else {
      soundEngine.playError?.();
      haptics.warning?.();
      alert(isRtl ? `موجودی سکه کافی نیست! (ورودی: ${t.entryFee} 🪙)` : `Insufficient coins! (Entry: ${t.entryFee} 🪙)`);
    }
  };

  const handleCheer = () => {
    setCheerCount(c => c + 1);
    soundEngine.playTap?.();
    haptics.impact?.('light');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] rounded-3xl bg-slate-950 border-2 border-yellow-500/40 shadow-[0_0_50px_rgba(234,179,8,0.25)] flex flex-col p-4 sm:p-5 text-start overflow-hidden relative"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    <span>{isRtl ? 'جام قهرمانان و تورنمنت‌های زنده' : 'Live Championships & Tournaments'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-bold">CUPS</span>
                  </h3>
                  <p className="text-[10px] text-amber-300 font-bold">
                    {isRtl ? 'ورودی رقابتی + جوایز میلیونی سکه' : 'Competitive entries + Big coin prize pools'}
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose} 
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 my-3 shrink-0">
              <button
                onClick={() => { setActiveTab('tours'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'tours'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'تورنمنت‌ها' : 'Tournaments'}
              </button>

              <button
                onClick={() => { setActiveTab('bracket'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'bracket'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'جدول حذفی' : 'Bracket Tree'}
              </button>

              <button
                onClick={() => { setActiveTab('spectator'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer relative ${
                  activeTab === 'spectator'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'تماشاگر زنده' : 'Spectator'}
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1 animate-pulse" />
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
              {/* TAB 1: TOURNAMENTS LIST */}
              {activeTab === 'tours' && (
                <div className="space-y-3">
                  {/* Daily Grand Tournament Card */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-600/30 via-orange-600/20 to-red-600/30 border-2 border-amber-500/50 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl">
                          👑
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                            <span>{isRtl ? 'تورنمنت بزرگ روزانه امشب' : "Tonight's Grand Tournament"}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-black uppercase">LIVE</span>
                          </h4>
                          <p className="text-[10px] text-amber-300 font-bold">
                            {isRtl ? 'تخته‌نرد، اسنوکر و حکم • ۱۶ نفره' : 'Backgammon, Snooker & Hokm • 16 Players'}
                          </p>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="font-mono font-black text-amber-300 text-base tracking-wider">{timeLeft}</div>
                        <div className="text-[9px] text-slate-400 font-bold">{isRtl ? 'تا شروع مسابقه' : 'Until match start'}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-xs font-bold text-slate-200">
                        {isRtl ? '🏅 استخر جایزه کل: ۲۰,۰۰۰ سکه' : '🏅 Prize Pool: 20,000 Coins'}
                      </span>
                      <button
                        onClick={() => handleJoin({ id: 'daily_grand', entryFee: 50, titleFa: 'تورنمنت بزرگ روزانه', titleEn: 'Daily Grand Tournament' })}
                        disabled={joinedTours.includes('daily_grand')}
                        className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 cursor-pointer ${
                          joinedTours.includes('daily_grand')
                            ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110'
                        }`}
                      >
                        {joinedTours.includes('daily_grand')
                          ? (isRtl ? 'ثبت‌نام شدید ✓' : 'Enrolled ✓')
                          : (isRtl ? 'ثبت‌نام (۵۰ 🪙)' : 'Join (50 🪙)')}
                      </button>
                    </div>
                  </div>

                  {/* Other Tournaments */}
                  {TOURNAMENTS_LIST.map(t => {
                    const isJoined = joinedTours.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        className={`p-4 rounded-3xl border bg-gradient-to-br ${t.color} space-y-2.5 shadow-lg`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-3xl">{t.icon}</span>
                            <div>
                              <h4 className="text-xs font-black text-white">{isRtl ? t.titleFa : t.titleEn}</h4>
                              <span className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 font-bold">
                                <Clock size={11} /> {isRtl ? t.startsInFa : t.startsInEn}
                              </span>
                            </div>
                          </div>

                          <div className="text-end">
                            <span className="text-xs font-black text-amber-300 block">{t.prizePool.toLocaleString()} 🪙</span>
                            <span className="text-[9px] text-slate-400 font-bold">{isRtl ? 'استخر جایزه' : 'Prize Pool'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                          <span className="text-[10px] text-slate-300 flex items-center gap-1 font-bold">
                            <Users size={12} /> {t.playersJoined}/{t.maxPlayers} {isRtl ? 'شرکت‌کننده' : 'Players'}
                          </span>

                          <button
                            onClick={() => handleJoin(t)}
                            disabled={isJoined}
                            className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
                              isJoined
                                ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md hover:brightness-110'
                            }`}
                          >
                            {isJoined 
                              ? (isRtl ? 'ثبت‌نام شدید ✓' : 'Enrolled ✓') 
                              : (isRtl ? `ورود (${t.entryFee} 🪙)` : `Enter (${t.entryFee} 🪙)`)}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: BRACKET TREE */}
              {activeTab === 'bracket' && (
                <div className="space-y-4">
                  {/* Final Championship Box */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 border-2 border-yellow-400/50 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-300">
                      <Crown size={15} />
                      <span>{isRtl ? 'فینال بزرگ جام استادان' : 'Grand Championship Final'}</span>
                    </div>

                    <div className="flex items-center justify-around">
                      <div className="text-center">
                        <span className="text-xs font-black text-white block">{MOCK_BRACKET.finalMatch.p1.name}</span>
                        <span className="text-lg font-black text-amber-400 font-mono">{MOCK_BRACKET.finalMatch.p1.score}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">VS</span>
                      <div className="text-center">
                        <span className="text-xs font-black text-white block">{MOCK_BRACKET.finalMatch.p2.name}</span>
                        <span className="text-lg font-black text-amber-400 font-mono">{MOCK_BRACKET.finalMatch.p2.score}</span>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-400 font-bold block">
                      🟢 {MOCK_BRACKET.finalMatch.statusFa}
                    </span>
                  </div>

                  {/* Semi Finals */}
                  <div>
                    <h5 className="text-[11px] font-black text-slate-300 mb-2">{isRtl ? 'مرحله نیمه‌نهایی' : 'Semi-Finals'}</h5>
                    <div className="space-y-2">
                      {MOCK_BRACKET.semiFinals.map((match, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={match.p1.won ? 'text-amber-300 font-black' : 'text-slate-400'}>{match.p1.name}</span>
                            <span className="font-mono text-slate-400">({match.p1.score})</span>
                          </div>
                          <span className="text-[10px] text-slate-600">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">({match.p2.score})</span>
                            <span className={match.p2.won ? 'text-amber-300 font-black' : 'text-slate-400'}>{match.p2.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quarter Finals */}
                  <div>
                    <h5 className="text-[11px] font-black text-slate-300 mb-2">{isRtl ? 'مرحله ۱/۴ نهایی' : 'Quarter-Finals'}</h5>
                    <div className="grid grid-cols-1 gap-2">
                      {MOCK_BRACKET.quarterFinals.map((match, i) => (
                        <div key={i} className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px]">
                          <span className={match.p1.won ? 'text-amber-300 font-bold' : 'text-slate-500'}>{match.p1.name}</span>
                          <span className="font-mono text-slate-500">{match.p1.score} - {match.p2.score}</span>
                          <span className={match.p2.won ? 'text-amber-300 font-bold' : 'text-slate-500'}>{match.p2.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE SPECTATOR */}
              {activeTab === 'spectator' && (
                <div className="space-y-3">
                  {LIVE_SPECTATOR_MATCHES.map((spec) => (
                    <div
                      key={spec.id}
                      className="p-4 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-2 border-purple-500/30 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{spec.gameIcon}</span>
                          <div>
                            <h4 className="text-xs font-black text-white">{spec.gameTitle}</h4>
                            <span className="text-[10px] text-purple-300 font-bold">{spec.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Eye size={12} />
                          <span>{spec.viewers} {isRtl ? 'تماشاگر' : 'viewers'}</span>
                        </div>
                      </div>

                      {/* Live Scoreboard */}
                      <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-around">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{spec.p1.avatar}</span>
                          <span className="text-xs font-black text-white">{spec.p1.name}</span>
                        </div>
                        <div className="font-mono font-black text-base text-amber-300 px-3 py-1 rounded-xl bg-amber-500/20">
                          {spec.p1.score} - {spec.p2.score}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{spec.p2.name}</span>
                          <span className="text-xl">{spec.p2.avatar}</span>
                        </div>
                      </div>

                      {/* Spectator Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handleCheer}
                          className="flex-1 py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/40 text-purple-200 text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <span>👏 تشویق بازیکنان</span>
                          {cheerCount > 0 && <span className="text-amber-300">({cheerCount})</span>}
                        </button>

                        <button
                          onClick={() => {
                            soundEngine.playTap?.();
                            haptics.notification?.('success');
                            alert(isRtl ? 'شما وارد جایگاه تماشاچیان VIP شدید! هیجان بازی را دنبال کنید.' : 'Joined VIP spectator lounge!');
                          }}
                          className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Eye size={14} />
                          <span>{isRtl ? 'ورود به میز' : 'Watch Live'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-white/10 shrink-0">
              {isRtl 
                ? '۲۰٪ از مجموع ورودی هر تورنمنت کارمزد پلتفرم بوده و مابقی تماماً به نفرات برتر تعلق می‌گیرد.' 
                : '20% platform pool fee applied, remaining 80% rewarded to top bracket winners.'}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
