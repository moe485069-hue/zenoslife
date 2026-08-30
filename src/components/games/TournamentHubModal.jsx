import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Swords, Clock, Star, ShieldCheck, Play } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';

export const TOURNAMENTS_LIST = [
  {
    id: 'tour_hokm',
    titleFa: 'جام طلایی حکم ۴ نفره',
    gameType: 'hokm',
    icon: '👑',
    entryFee: 100,
    prizePool: 5000,
    playersJoined: 28,
    maxPlayers: 32,
    startsIn: '۱۵ دقیقه دیگر',
    color: 'from-amber-600/30 to-yellow-900/40 border-amber-400/50'
  },
  {
    id: 'tour_backgammon',
    titleFa: 'لیگ استادان تخته‌نرد ایران',
    gameType: 'backgammon',
    icon: '🎲',
    entryFee: 200,
    prizePool: 10000,
    playersJoined: 14,
    maxPlayers: 16,
    startsIn: '۴۰ دقیقه دیگر',
    color: 'from-rose-600/30 to-amber-900/40 border-rose-400/50'
  },
  {
    id: 'tour_pasur',
    titleFa: 'مسابقه برق‌آسای پاستور',
    gameType: 'pasur',
    icon: '🃏',
    entryFee: 50,
    prizePool: 2500,
    playersJoined: 8,
    maxPlayers: 8,
    startsIn: 'در حال برگزاری',
    color: 'from-green-600/30 to-emerald-900/40 border-green-400/50'
  }
];

export default function TournamentHubModal({ isOpen, onClose }) {
  const { coins, spendCoins } = useAppStore();
  const [joinedTours, setJoinedTours] = useState([]);

  const handleJoin = (t) => {
    if (joinedTours.includes(t.id)) return;
    if (spendCoins(t.entryFee)) {
      setJoinedTours([...joinedTours, t.id]);
      soundEngine.playLevelUp?.();
      alert(`🎉 شما با موفقیت در ${t.titleFa} ثبت‌نام شدید! به محض تکمیل ظرفیت اطلاع‌رسانی می‌شود.`);
    } else {
      alert(`موجودی سکه کافی نیست! (ورودی: ${t.entryFee} سکه)`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-yellow-500/40 flex flex-col justify-between p-5 shadow-2xl text-right overflow-y-auto"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                  <Trophy size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">جام قهرمانان و تورنمنت‌های زنده</h3>
                  <p className="text-[10px] text-amber-300 font-bold">ورودی رقابتی + جوایز میلیونی سکه و تتر</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
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
                          <h4 className="text-xs font-black text-white">{t.titleFa}</h4>
                          <span className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {t.startsIn}
                          </span>
                        </div>
                      </div>

                      <div className="text-left">
                        <span className="text-xs font-black text-amber-300 block">{t.prizePool.toLocaleString()} 🪙</span>
                        <span className="text-[9px] text-slate-400">استخر جایزه</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                      <span className="text-[10px] text-slate-300 flex items-center gap-1 font-bold">
                        <Users size={12} /> {t.playersJoined}/{t.maxPlayers} شرکت‌کننده
                      </span>

                      <button
                        onClick={() => handleJoin(t)}
                        disabled={isJoined}
                        className={`px-4 py-1.5 rounded-xl font-black text-xs transition-all active:scale-95 ${
                          isJoined
                            ? 'bg-green-500/20 border border-green-400 text-green-300'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                        }`}
                      >
                        {isJoined ? 'ثبت‌نام شدید ✓' : `ورود (${t.entryFee} 🪙)`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-white/10">
              ۲۰٪ از مجموع ورودی هر تورنمنت کارمزد پلتفرم بوده و مابقی تماماً به نفرات برتر تعلق می‌گیرد.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
