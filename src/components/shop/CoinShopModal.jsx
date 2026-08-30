import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, X, Star, CreditCard, Sparkles, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export const COIN_PACKAGES = [
  {
    id: 'pack_starter',
    nameFa: 'بسته برنز نوپا',
    coins: 1000,
    bonus: 0,
    stars: 35,
    toman: '۲۵,۰۰۰ تومان',
    color: 'from-amber-600/30 to-yellow-800/30 border-amber-500/40',
    icon: '🪙',
    badge: null
  },
  {
    id: 'pack_popular',
    nameFa: 'بسته نقره محبوب',
    coins: 5000,
    bonus: 500,
    stars: 150,
    toman: '۹۵,۰۰۰ تومان',
    color: 'from-blue-600/30 to-indigo-800/30 border-blue-400/50',
    icon: '💰',
    badge: '🔥 پرفروش‌ترین'
  },
  {
    id: 'pack_gold',
    nameFa: 'صندوق طلایی اشرافی',
    coins: 20000,
    bonus: 3000,
    stars: 500,
    toman: '۲۹۰,۰۰۰ تومان',
    color: 'from-yellow-600/30 to-amber-900/40 border-yellow-400/60 ring-1 ring-yellow-400/30',
    icon: '👑',
    badge: '✨ ویژه مسابقات'
  },
  {
    id: 'pack_legendary',
    nameFa: 'خزانه افسانه‌ای کیهان',
    coins: 50000,
    bonus: 10000,
    stars: 1000,
    toman: '۵۹۰,۰۰۰ تومان',
    color: 'from-purple-600/30 to-fuchsia-900/40 border-purple-400/60 ring-2 ring-purple-400/40',
    icon: '💎',
    badge: '🌌 پکیج نامحدود + VIP'
  }
];

export default function CoinShopModal({ isOpen, onClose }) {
  const { coins, addCoins, activateVip } = useAppStore();
  const [selectedPack, setSelectedPack] = useState(COIN_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState('stars'); // 'stars' | 'card'
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePurchase = () => {
    setIsProcessing(true);
    soundEngine.playTap?.();
    haptics.impact?.();

    // Check if running inside Telegram Mini App with openInvoice
    if (window.Telegram?.WebApp?.openInvoice && paymentMethod === 'stars') {
      try {
        window.Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
      } catch (_) {}
    }

    setTimeout(() => {
      setIsProcessing(false);
      const totalCoins = selectedPack.coins + selectedPack.bonus;
      addCoins(totalCoins, 'Shop Purchase');
      if (selectedPack.id === 'pack_legendary') {
        activateVip(30);
      }
      setShowSuccess(true);
      soundEngine.playLevelUp?.();
    }, 1200);
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
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                  <Coins size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    <span>فروشگاه سکه و الماس زنوسلایف</span>
                  </h3>
                  <p className="text-[11px] text-amber-300 font-bold">
                    موجودی فعلی شما: {coins.toLocaleString()} 🪙
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Success View */}
            {showSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="text-6xl animate-bounce">🎉</div>
                <h4 className="text-xl font-black text-green-300">خرید با موفقیت انجام شد!</h4>
                <p className="text-xs text-slate-300">
                  تعداد {(selectedPack.coins + selectedPack.bonus).toLocaleString()} سکه به حساب شما واریز گردید.
                </p>
                <button
                  onClick={() => { setShowSuccess(false); onClose(); }}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-slate-950 font-black text-xs active:scale-95 shadow-lg"
                >
                  بازگشت و شروع بازی 🚀
                </button>
              </div>
            ) : (
              <div className="space-y-4 my-3">
                {/* Packages Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {COIN_PACKAGES.map(pack => {
                    const isSelected = selectedPack.id === pack.id;
                    return (
                      <motion.div
                        key={pack.id}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => { setSelectedPack(pack); soundEngine.playTap?.(); }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all bg-gradient-to-br ${pack.color} relative ${
                          isSelected
                            ? 'ring-2 ring-yellow-400 shadow-xl shadow-yellow-500/20 scale-[1.02]'
                            : 'hover:border-white/30'
                        }`}
                      >
                        {pack.badge && (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-slate-950 text-[9px] font-black shadow">
                            {pack.badge}
                          </span>
                        )}

                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{pack.icon}</span>
                          <div className="text-left">
                            <span className="text-xs font-black text-amber-300 block">{pack.stars} ⭐️</span>
                            <span className="text-[9px] text-slate-400">{pack.toman}</span>
                          </div>
                        </div>

                        <div className="mt-2">
                          <h4 className="text-xs font-black text-white">{pack.nameFa}</h4>
                          <p className="text-sm font-black text-yellow-400 mt-0.5">
                            {pack.coins.toLocaleString()} 🪙
                          </p>
                          {pack.bonus > 0 && (
                            <span className="text-[10px] text-green-400 font-bold">+{pack.bonus.toLocaleString()} هدیه</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Payment Method Selector */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400">روش پرداخت:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setPaymentMethod('stars'); soundEngine.playTap?.(); }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'stars'
                          ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow'
                          : 'border-white/10 bg-white/5 text-slate-400'
                      }`}
                    >
                      <Star size={14} className="text-yellow-400" /> ستاره‌های تلگرام (Stars)
                    </button>
                    <button
                      onClick={() => { setPaymentMethod('card'); soundEngine.playTap?.(); }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-400 bg-blue-500/20 text-blue-300 shadow'
                          : 'border-white/10 bg-white/5 text-slate-400'
                      }`}
                    >
                      <CreditCard size={14} className="text-blue-400" /> کارت شتاب / ریالی
                    </button>
                  </div>
                </div>

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-sm shadow-xl shadow-yellow-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">در حال اتصال به درگاه پرداخت...</span>
                  ) : (
                    <>
                      <Zap size={16} /> خرید {selectedPack.nameFa} ({paymentMethod === 'stars' ? selectedPack.stars + ' ستاره' : selectedPack.toman})
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>پرداخت امن و تحویل آنی درون تلگرام با ضمانت رسمی زنوسلایف</span>
                </div>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
