import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Trophy } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

const PRIZES = [
  { id: 1, label: '۵۰ سکه 🪙', coins: 50, xp: 10, angle: 0 },
  { id: 2, label: '۱۰۰ سکه 💰', coins: 100, xp: 20, angle: 60 },
  { id: 3, label: '+۳۰ XP ⚡', coins: 20, xp: 30, angle: 120 },
  { id: 4, label: '۲۵۰ سکه 💎', coins: 250, xp: 50, angle: 180 },
  { id: 5, label: '۵۰۰ سکه 👑', coins: 500, xp: 100, angle: 240 },
  { id: 6, label: 'VIP ۱ روزه 🌟', coins: 100, xp: 50, isVip: true, angle: 300 },
];

export default function LuckyWheelModal({ isOpen, onClose }) {
  const { coins, addCoins, addXp, language } = useAppStore();
  const isRtl = language === 'fa';

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);

  const lastSpinDate = localStorage.getItem('zen_last_wheel_spin');
  const todayStr = new Date().toISOString().slice(0, 10);
  const isFreeSpin = lastSpinDate !== todayStr;

  const handleSpin = () => {
    if (isSpinning) return;

    if (!isFreeSpin && (coins || 0) < 20) {
      soundEngine.playError?.();
      return;
    }

    if (!isFreeSpin) {
      addCoins(-20);
    } else {
      localStorage.setItem('zen_last_wheel_spin', todayStr);
    }

    setIsSpinning(true);
    setWonPrize(null);
    soundEngine.playDiceRoll?.();
    haptics.impact?.('heavy');

    const randomPrizeIndex = Math.floor(Math.random() * PRIZES.length);
    const selectedPrize = PRIZES[randomPrizeIndex];
    const extraSpins = 5 * 360;
    const targetAngle = extraSpins + (360 - selectedPrize.angle);

    setRotation(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      addCoins(selectedPrize.coins);
      addXp?.(selectedPrize.xp);
      soundEngine.playWin?.();
      haptics.success?.();
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0b2e] via-[#12071f] to-[#0a0312] border border-purple-500/40 p-6 text-center shadow-2xl shadow-purple-950/60 overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-amber-400" size={24} />
            <h2 className="text-xl font-black text-white">
              {isRtl ? 'گردونه شانس زنوسلایف' : 'Lucky Spin Wheel'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 mb-6">
            {isFreeSpin
              ? (isRtl ? '🎁 چرخش امروز شما کاملاً رایگان است!' : '🎁 Your spin today is 100% FREE!')
              : (isRtl ? 'هزینه چرخش بعدی: ۲۰ سکه 🪙' : 'Cost per next spin: 20 Coins 🪙')}
          </p>

          <div className="relative w-56 h-56 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-md" />

            <motion.div
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.15, 0.9, 0.2, 1] }}
              className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-2xl overflow-hidden relative"
              style={{
                background: 'conic-gradient(#f59e0b 0deg 60deg, #10b981 60deg 120deg, #0ea5e9 120deg 180deg, #8b5cf6 180deg 240deg, #f43f5e 240deg 300deg, #eab308 300deg 360deg)'
              }}
            >
              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center z-10 shadow-lg">
                <span className="text-lg">👑</span>
              </div>
            </motion.div>
          </div>

          {wonPrize && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-black flex items-center justify-center gap-2"
            >
              <Trophy size={18} />
              <span>{isRtl ? `تبریک! شما برنده شدید: ${wonPrize.label}` : `Won: ${wonPrize.label}`}</span>
            </motion.div>
          )}

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base shadow-lg shadow-orange-500/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSpinning
              ? (isRtl ? 'در حال چرخش...' : 'Spinning...')
              : isFreeSpin
                ? (isRtl ? '🎰 چرخش رایگان روزانه!' : '🎰 FREE Daily Spin!')
                : (isRtl ? '🎰 چرخش مجدد (۲۰ سکه)' : '🎰 Spin Again (20 Coins)')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
