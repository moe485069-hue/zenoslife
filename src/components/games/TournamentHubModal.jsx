import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Swords, Clock, Star, ShieldCheck, Play, Sparkles } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';

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
    id: 'tour_pasur',
    titleFa: 'مسابقه برق‌آسای پاستور',
    titleEn: 'Lightning Pasur Tournament',
    gameType: 'pasur',
    icon: '🃏',
    entryFee: 50,
    prizePool: 2500,
    playersJoined: 8,
    maxPlayers: 8,
    startsInFa: 'در حال برگزاری',
    startsInEn: 'In Progress',
    color: 'from-green-600/30 to-emerald-900/40 border-green-400/50'
  }
];

export default function TournamentHubModal({ isOpen, onClose }) {
  const { coins, spendCoins, language } = useAppStore();
  const isRtl = language === 'fa';
  const [joinedTours, setJoinedTours] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      const tonight = new Date();
      tonight.setHours(21, 0, 0, 0); // 9 PM tonight
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
      alert(isRtl 
        ? `🎉 شما با موفقیت در ${t.titleFa} ثبت‌نام شدید! به محض تکمیل ظرفیت اطلاع‌رسانی می‌شود.` 
        : `🎉 Successfully enrolled in ${t.titleEn}! You will be notified when match starts.`);
    } else {
      alert(isRtl 
        ? `موجودی سکه کافی نیست! (ورودی: ${t.entryFee} سکه)` 
        : `Insufficient coins! (Entry: ${t.entryFee} coins)`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] rounded-3xl bg-slate-900 border-2 border-yellow-500/40 flex flex-col justify-between p-5 shadow-2xl text-start overflow-y-auto pb-6"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {isRtl ? 'جام قهرمانان و تورنمنت‌های زنده' : 'Live Championships & Tournaments'}
                  </h3>
                  <p className="text-[10px] text-amber-300 font-bold">
                    {isRtl ? 'ورودی رقابتی + جوایز میلیونی سکه' : 'Competitive entries + Big coin prize pools'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors"
                title={isRtl ? 'بستن' : 'Close'}
              >
                <X size={16} />
              </button>
            </div>

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
                      {isRtl ? 'تخته‌نرد و حکم شاهانه • ۸ نفره' : 'Royal Backgammon & Hokm • 8 Players'}
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <div className="font-mono font-black text-amber-300 text-base tracking-wider">{timeLeft}</div>
                  <div className="text-[9px] text-slate-400 font-bold">{isRtl ? 'تا شروع مسابقه' : 'Until match start'}</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs font-bold text-slate-200">{isRtl ? '🏅 استخر جایزه کل: ۲۰,۰۰۰ سکه' : '🏅 Prize Pool: 20,000 Coins'}</span>
                <button
                  onClick={() => handleJoin({ id: 'daily_grand', entryFee: 50, titleFa: 'تورنمنت بزرگ روزانه', titleEn: 'Daily Grand Tournament' })}
                  disabled={joinedTours.includes('daily_grand')}
                  className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
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

            {/* Tournaments List */}
            <div className="space-y-3 my-3">
              {TOURNAMENTS_LIST.map(t => {
                const isJoined = joinedTours.includes(t.id);
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-3xl border bg-gradient-to-br ${t.color} space-y-2.5 shadow-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{t.icon}</span>
                        <div>
                          <h4 className="text-xs font-black text-white">{isRtl ? t.titleFa : t.titleEn}</h4>
                          <span className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 font-bold">
                            <Clock size={10} /> {isRtl ? t.startsInFa : t.startsInEn}
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
                            ? 'bg-green-500/20 border border-green-400 text-green-300'
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

            <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-white/10">
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
