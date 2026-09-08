import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Gift, Clock, Award, Star, Flame, Trophy } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import ConfettiOverlay from './ConfettiOverlay';

const WHEEL_SECTORS = [
  { id: 0, labelFa: '۵۰ سکه', labelEn: '50 Coins', icon: '🪙', color: '#f59e0b', type: 'coins', value: 50, weight: 30 },
  { id: 1, labelFa: '۱۰۰ سکه', labelEn: '100 Coins', icon: '💰', color: '#10b981', type: 'coins', value: 100, weight: 25 },
  { id: 2, labelFa: 'تم طلایی', labelEn: 'Gold Theme', icon: '👑', color: '#f97316', type: 'theme', value: 'luxury_gold', weight: 10 },
  { id: 3, labelFa: '۲۵۰ سکه', labelEn: '250 Coins', icon: '💎', color: '#06b6d4', type: 'coins', value: 250, weight: 15 },
  { id: 4, labelFa: '۵۰ امتیاز', labelEn: '50 XP', icon: '⭐', color: '#8b5cf6', type: 'xp', value: 50, weight: 20 },
  { id: 5, labelFa: '۵۰۰ سکه', labelEn: '500 Coins', icon: '🔥', color: '#ec4899', type: 'coins', value: 500, weight: 8 },
  { id: 6, labelFa: 'بلیت جام', labelEn: 'Cup Ticket', icon: '🎟️', color: '#3b82f6', type: 'ticket', value: 1, weight: 10 },
  { id: 7, labelFa: '۱,۰۰۰ سکه', labelEn: '1,000 Coins', icon: '🌟', color: '#e11d48', type: 'coins', value: 1000, weight: 4 },
];

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export default function DailyLuckyWheelModal({ isOpen, onClose }) {
  const { addCoins, addXp, language } = useAppStore();
  const isRtl = language === 'fa';

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    const checkCooldown = () => {
      const lastSpin = parseInt(localStorage.getItem('chazha_wheel_last_spin') || '0', 10);
      const diff = Date.now() - lastSpin;
      if (diff < COOLDOWN_MS) {
        setCooldownRemaining(COOLDOWN_MS - diff);
      } else {
        setCooldownRemaining(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSpin = () => {
    if (isSpinning || cooldownRemaining > 0) return;

    setIsSpinning(true);
    setWonPrize(null);
    setShowConfetti(false);

    const totalWeight = WHEEL_SECTORS.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;
    let selectedSector = WHEEL_SECTORS[0];
    for (const sector of WHEEL_SECTORS) {
      if (rand < sector.weight) {
        selectedSector = sector;
        break;
      }
      rand -= sector.weight;
    }

    const numSectors = WHEEL_SECTORS.length;
    const sectorAngle = 360 / numSectors;
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const targetSectorAngle = (numSectors - selectedSector.id) * sectorAngle;
    const sliceMargin = (Math.random() * 0.6 - 0.3) * sectorAngle;
    const totalTargetRotation = rotation + (extraSpins * 360) + targetSectorAngle + sliceMargin;

    setRotation(totalTargetRotation);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      tickCount++;
      soundEngine.playWheelTick?.();
      haptics.wheelTick?.();
      if (tickCount > 25) clearInterval(tickInterval);
    }, 160);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWonPrize(selectedSector);
      setShowConfetti(true);
      soundEngine.playWheelJackpot?.();
      haptics.notification?.('success');

      if (selectedSector.type === 'coins') {
        addCoins?.(selectedSector.value);
      } else if (selectedSector.type === 'xp') {
        addXp?.(selectedSector.value);
      } else if (selectedSector.type === 'theme') {
        addCoins?.(150);
      } else if (selectedSector.type === 'ticket') {
        addCoins?.(100);
      }

      localStorage.setItem('chazha_wheel_last_spin', Date.now().toString());
      setCooldownRemaining(COOLDOWN_MS);
    }, 4400);
  };

  const sectorAngle = 360 / WHEEL_SECTORS.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={onClose}
        >
          {showConfetti && <ConfettiOverlay onComplete={() => setShowConfetti(false)} />}

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-950 border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] p-5 text-center flex flex-col items-center relative overflow-hidden"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Gift size={18} />
                </div>
                <div className="text-start">
                  <h3 className="text-sm font-black text-white">
                    {isRtl ? 'گردونه شانس روزانه چاژا' : 'Chazha Daily Lucky Wheel'}
                  </h3>
                  <p className="text-[10px] text-amber-300 font-bold">
                    {isRtl ? 'هر ۲۴ ساعت یک چرخش کاملاً رایگان!' : '1 Free Spin Every 24 Hours!'}
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

            <div className="relative w-64 h-64 my-4 flex items-center justify-center select-none">
              <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-300 -mt-2 border-2 border-slate-950" />
              </div>

              <div className="absolute inset-0 rounded-full border-4 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.4),inset_0_0_15px_rgba(245,158,11,0.3)] pointer-events-none z-10" />

              <motion.div
                animate={{ rotate: rotation }}
                transition={{
                  duration: isSpinning ? 4.2 : 0,
                  ease: [0.15, 0.9, 0.2, 1]
                }}
                className="w-full h-full rounded-full relative overflow-hidden bg-slate-900 border-4 border-slate-950 shadow-inner flex items-center justify-center"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                  {WHEEL_SECTORS.map((sector, i) => {
                    const startAngle = i * sectorAngle;
                    const endAngle = (i + 1) * sectorAngle;
                    const radStart = (startAngle * Math.PI) / 180;
                    const radEnd = (endAngle * Math.PI) / 180;
                    const x1 = 100 + 100 * Math.cos(radStart);
                    const y1 = 100 + 100 * Math.sin(radStart);
                    const x2 = 100 + 100 * Math.cos(radEnd);
                    const y2 = 100 + 100 * Math.sin(radEnd);
                    const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                    return (
                      <path
                        key={sector.id}
                        d={pathData}
                        fill={sector.color}
                        stroke="#090d16"
                        strokeWidth="1.5"
                        opacity="0.9"
                      />
                    );
                  })}
                </svg>

                {WHEEL_SECTORS.map((sector, i) => {
                  const angle = i * sectorAngle + sectorAngle / 2;
                  return (
                    <div
                      key={sector.id}
                      className="absolute w-full h-full top-0 left-0 flex items-start justify-center pt-2.5 pointer-events-none"
                      style={{ transform: `rotate(${angle}deg)` }}
                    >
                      <div className="flex flex-col items-center transform rotate-180 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                        <span className="text-sm font-black leading-none">{sector.icon}</span>
                        <span className="text-[9px] font-black mt-0.5 tracking-tighter whitespace-nowrap">
                          {isRtl ? sector.labelFa : sector.labelEn}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border-2 border-white shadow-[0_0_12px_rgba(0,0,0,0.8)] flex items-center justify-center z-20">
                  <Sparkles size={18} className="text-slate-950 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
              </motion.div>
            </div>

            {wonPrize && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/25 to-amber-500/20 border border-amber-400/50 mb-3"
              >
                <div className="text-xs text-amber-300 font-bold">
                  {isRtl ? '🎉 تبریک! جایزه شما:' : '🎉 Congratulations! You won:'}
                </div>
                <div className="text-base font-black text-white flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-xl">{wonPrize.icon}</span>
                  <span>{isRtl ? wonPrize.labelFa : wonPrize.labelEn}</span>
                </div>
              </motion.div>
            )}

            {cooldownRemaining > 0 ? (
              <div className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                  <Clock size={15} className="text-amber-400" />
                  <span>{isRtl ? 'چرخش بعدی در:' : 'Next spin in:'}</span>
                </div>
                <div className="font-mono font-black text-amber-300 text-sm tracking-wider">
                  {formatTime(cooldownRemaining)}
                </div>
              </div>
            ) : (
              <button
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                <span>{isSpinning ? (isRtl ? 'در حال چرخش...' : 'Spinning...') : (isRtl ? '🎡 بچرخون (رایگان)' : '🎡 Spin Now (Free)')}</span>
              </button>
            )}

            <p className="text-[10px] text-slate-400 mt-3">
              {isRtl ? 'با هر چرخش شانس برد جک‌پات ۱,۰۰۰ سکه را خواهید داشت!' : 'Every spin gives a chance to win the 1,000 coins Jackpot!'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
