import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Send } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useMultiplayerStore from '../../store/multiplayerStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export const GIFTS_CATALOG = [
  { id: 'rose', nameFa: 'شاخه گل رز سرخ', icon: '🌹', price: 10, color: 'from-rose-500 to-red-700', desc: 'نشانه احترام و صمیمیت' },
  { id: 'rocket', nameFa: 'موشک فضایی کیهان', icon: '🚀', price: 50, color: 'from-purple-500 to-indigo-700', desc: 'پرواز به اوج انرژی' },
  { id: 'crown', nameFa: 'تاج پادشاهی طلایی', icon: '👑', price: 150, color: 'from-amber-500 to-yellow-700', desc: 'احترام شاهانه' },
  { id: 'diamond', nameFa: 'الماس درخشان ابدی', icon: '💎', price: 300, color: 'from-cyan-400 to-blue-600', desc: 'هدیه لوکس و کم‌نظیر' }
];

export default function SuperGiftingModal({ isOpen, onClose, targetUser }) {
  const { coins, spendCoins } = useAppStore();
  const { sendAnimatedGift } = useMultiplayerStore();

  if (!targetUser) return null;

  const handleSend = (gift) => {
    if ((coins || 0) < gift.price) {
      alert('موجودی سکه شما کافی نیست!');
      return;
    }

    if (spendCoins(gift.price)) {
      soundEngine.playLevelUp?.();
      haptics.notification?.();
      sendAnimatedGift(gift, targetUser);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-purple-500/40 p-5 shadow-2xl space-y-4 text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Gift size={20} className="text-pink-400" />
                <h3 className="text-sm font-black text-white">
                  ارسال هدیه به {targetUser.avatar} {targetUser.name || targetUser.fullName}
                </h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هدیه شما با انیمیشن متحرک روی کل صفحه برای همه کاربران نمایش داده می‌شود!
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {GIFTS_CATALOG.map(gift => (
                <motion.button
                  key={gift.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSend(gift)}
                  className={`p-3.5 rounded-2xl border border-white/10 bg-gradient-to-br ${gift.color}/20 hover:border-purple-400 text-right space-y-1 transition-all shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{gift.icon}</span>
                    <span className="text-xs font-black text-amber-300">{gift.price} 🪙</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{gift.nameFa}</h4>
                  <p className="text-[10px] text-slate-400">{gift.desc}</p>
                </motion.button>
              ))}
            </div>

            <div className="text-center pt-1 text-[11px] text-slate-400">
              موجودی شما: <span className="text-amber-400 font-bold">{coins} سکه</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
