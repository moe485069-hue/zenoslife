import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, X, Check, Star, Zap, Eye, Rocket, MessageSquare, ShieldCheck } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';

export default function VipSubscriptionModal({ isOpen, onClose }) {
  const { isVip, activateVip, isBoosted, activateProfileBoost, likedByList, spendCoins, coins } = useAppStore();

  const handleBuyVip = () => {
    activateVip(30);
    soundEngine.playLevelUp?.();
    alert('🎉 تبریک! اشتراک طلایی Zen VIP Pass به مدت ۳۰ روز برای شما فعال شد.');
    onClose();
  };

  const handleBoostProfile = () => {
    if (spendCoins(100)) {
      activateProfileBoost(24);
      soundEngine.playLevelUp?.();
      alert('🚀 پروفایل شما به مدت ۲۴ ساعت در رتبه اول رادار دوستیابی قرار گرفت!');
    } else {
      alert('سکه کافی ندارید! (۱۰۰ سکه نیاز است)');
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
            className="w-full max-w-md max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-amber-400/50 flex flex-col justify-between p-5 shadow-2xl text-right overflow-y-auto"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Crown size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-amber-300">اشتراک طلایی Zen VIP Pass</h3>
                  <p className="text-[10px] text-slate-400">امکانات نامحدود دوستیابی، چت و بازی‌ها</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 my-3">
              {/* VIP Benefits List */}
              <div className="space-y-2.5">
                {[
                  { icon: <Eye className="text-amber-400" size={16} />, title: 'مشاهده چه کسانی شما را لایک کرده‌اند', desc: 'دیدن کامل پروفایل و پی‌وی تمام علاقه‌مندان' },
                  { icon: <Rocket className="text-pink-400" size={16} />, title: 'بوست اختصاصی در صدر لیست دوستیابی', desc: '۳ برابر دیده شدن بیشتر در تالار هم‌فرکانس‌ها' },
                  { icon: <MessageSquare className="text-purple-400" size={16} />, title: 'سوپر دایرکت (Super DM) نامحدود', desc: 'پیام مستقیم به هر کاربر بدون نیاز به مچ شدن' },
                  { icon: <Crown className="text-yellow-400" size={16} />, title: 'نشان طلایی VIP و رنگ نام کاربری اختصاصی', desc: 'درخشش در چت‌روم‌ها و میزهای بازی' }
                ].map((b, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                    <div className="p-1.5 rounded-xl bg-black/40 border border-white/10 mt-0.5">{b.icon}</div>
                    <div>
                      <h4 className="text-xs font-black text-white">{b.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Liked By Preview (Blur if not VIP) */}
              <div className="p-3.5 rounded-2xl bg-pink-950/30 border border-pink-500/30 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-pink-300">💖 علاقه‌مندان به شما ({likedByList.length} نفر)</span>
                  {isVip && <span className="text-[9px] text-green-400 font-bold">آنلاک شده ✓</span>}
                </div>

                <div className={`grid grid-cols-3 gap-2 ${!isVip ? 'filter blur-sm select-none pointer-events-none' : ''}`}>
                  {likedByList.map(u => (
                    <div key={u.id} className="p-2 rounded-xl bg-black/40 border border-white/10 text-center text-xs">
                      <span className="text-2xl">{u.avatar}</span>
                      <p className="font-bold text-white truncate mt-1">{u.name}</p>
                      <span className="text-[9px] text-slate-400">{u.city}</span>
                    </div>
                  ))}
                </div>

                {!isVip && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2">
                    <p className="text-xs font-black text-amber-300 text-center">
                      🔒 برای مشاهده پروفایل علاقه‌مندان، اشتراک VIP تهیه کنید
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {!isVip ? (
                  <button
                    onClick={handleBuyVip}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs shadow-xl shadow-yellow-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Crown size={16} /> فعال‌سازی VIP (۱۵۰ ستاره / ۹۹,۰۰۰ تومان ماهانه)
                  </button>
                ) : (
                  <button
                    onClick={handleBoostProfile}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Rocket size={15} /> بوست ۲۴ ساعته پروفایل (۱۰۰ 🪙)
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
