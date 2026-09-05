import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertTriangle, ShieldCheck, Target, Award } from 'lucide-react';
import soundEngine from '../../utils/audio';

export default function SnookerRulesModal({ isOpen, onClose, isRtl = true }) {
  if (!isOpen) return null;

  const balls = [
    { nameFa: 'قرمز (۱۵ عدد)', nameEn: 'Red (15)', pts: 1, color: '#dc2626' },
    { nameFa: 'زرد', nameEn: 'Yellow', pts: 2, color: '#eab308' },
    { nameFa: 'سبز', nameEn: 'Green', pts: 3, color: '#16a34a' },
    { nameFa: 'قهوه‌ای', nameEn: 'Brown', pts: 4, color: '#854d0e' },
    { nameFa: 'آبی', nameEn: 'Blue', pts: 5, color: '#2563eb' },
    { nameFa: 'صورتی', nameEn: 'Pink', pts: 6, color: '#ec4899' },
    { nameFa: 'مشکی', nameEn: 'Black', pts: 7, color: '#18181b' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-emerald-500/30 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[88vh] flex flex-col"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <h3 className="text-base font-black text-white">
                {isRtl ? 'قوانین رسمی اسنوکر جهانی' : 'Official Snooker Rules'}
              </h3>
            </div>
            <button
              onClick={() => { soundEngine?.playTap?.(); onClose(); }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
            >
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto space-y-4 text-xs pr-1 text-slate-300 custom-scrollbar flex-1">
            {/* 1. Ball Points */}
            <div>
              <h4 className="font-black text-amber-400 mb-2 flex items-center gap-1.5">
                <Target size={14} />
                <span>{isRtl ? 'ارزش امتیازی توپ‌ها' : 'Ball Point Values'}</span>
              </h4>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {balls.map((b, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
                    <span
                      className="w-4 h-4 rounded-full shadow-md"
                      style={{ backgroundColor: b.color }}
                    />
                    <span className="text-[10px] text-slate-300 font-bold">{isRtl ? b.nameFa : b.nameEn}</span>
                    <span className="text-xs font-mono font-black text-amber-400">+{b.pts}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Order of Play */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <h4 className="font-black text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>{isRtl ? 'ترتیب بازی و بریک زدن' : 'Order of Play & Breaks'}</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                <li>{isRtl ? 'ابتدا باید به یک توپ قرمز ضربه بزنید و آن را پاکت کنید (۱ امتیاز).' : 'Pot a red ball first (+1 pt).'}</li>
                <li>{isRtl ? 'سپس باید یک توپ رنگی (زرد تا مشکی) را نامزد کرده و پاکت کنید (۲ تا ۷ امتیاز).' : 'Nominate and pot any colour (+2 to +7 pts).'}</li>
                <li>{isRtl ? 'توپ رنگی پاکت شده دوباره به جای اصلی‌اش برمی‌گردد (ری‌اسپاون).' : 'Colours are respotted back to their spots while reds remain.'}</li>
                <li>{isRtl ? 'این چرخه (قرمز ⬅️ رنگی ⬅️ قرمز) تا پاکت شدن تمام ۱۵ قرمز ادامه می‌یابد.' : 'Alternate red-colour until all reds are cleared.'}</li>
                <li>{isRtl ? 'در پایان، ۶ توپ رنگی به ترتیب صعودی (زرد ⬅️ سبز ⬅️ قهوه‌ای ⬅️ آبی ⬅️ صورتی ⬅️ مشکی) پاکت شده و بازی تمام می‌شود.' : 'Final phase: clear colours sequentially from Yellow to Black.'}</li>
              </ul>
            </div>

            {/* 3. Fouls & Penalties */}
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-rose-200">
              <h4 className="font-black text-rose-400 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                <span>{isRtl ? 'خطاها و جریمه‌ها (Foul)' : 'Fouls & Penalties'}</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-rose-300/80">
                <li>{isRtl ? 'افتادن سفید داخل پاکت (In-off)' : 'Cue ball potted (In-off)'}</li>
                <li>{isRtl ? 'عدم برخورد با هیچ توپی یا برخورد اول با توپ اشتباه' : 'Missing all balls or hitting wrong target ball first'}</li>
                <li>{isRtl ? 'پاکت شدن همزمان توپ قرمز و رنگی' : 'Pocketing red and colour in same shot'}</li>
                <li>{isRtl ? 'حداقل جریمه هر خطا ۴ امتیاز است (یا امتیاز توپ خطا در صورتی که بیشتر از ۴ باشد) که به حساب حریف واریز می‌شود!' : 'Penalty is minimum 4 pts (or ball value if higher) awarded to opponent!'}</li>
              </ul>
            </div>

            {/* 4. Maximum Break */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300">
              <div>
                <p className="font-black text-xs">{isRtl ? 'بالاترین بریک ممکن (Maximum 147)' : 'Maximum 147 Break'}</p>
                <p className="text-[10px] text-amber-400/80">{isRtl ? '۱۵ قرمز + ۱۵ مشکی + ۶ رنگی نهایی' : '15 Reds + 15 Blacks + Final 6 Colours'}</p>
              </div>
              <span className="text-xl font-mono font-black">۱۴۷ 🏆</span>
            </div>
          </div>

          <button
            onClick={() => { soundEngine?.playTap?.(); onClose(); }}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg active:scale-95"
          >
            {isRtl ? 'متوجه شدم، بزن بریم 🎱' : 'Got it, let’s play!'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
