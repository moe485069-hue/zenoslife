import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Check, Sparkles } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function SnookerSpinModal({
  isOpen,
  onClose,
  spinOffset = { x: 0, y: 0 },
  onChangeSpin,
  isRtl = true
}) {
  const [localSpin, setLocalSpin] = useState(spinOffset);
  const containerRef = useRef(null);

  if (!isOpen) return null;

  const handlePointer = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    const dx = (e.clientX - centerX) / radius;
    const dy = (e.clientY - centerY) / radius;

    // Clamp inside unit circle
    const dist = Math.hypot(dx, dy);
    let nx = dx;
    let ny = dy;
    if (dist > 0.85) {
      nx = (dx / dist) * 0.85;
      ny = (dy / dist) * 0.85;
    }

    const updated = { x: nx, y: ny };
    setLocalSpin(updated);
    onChangeSpin(updated);
  };

  const handleReset = () => {
    soundEngine?.playTap?.();
    const zero = { x: 0, y: 0 };
    setLocalSpin(zero);
    onChangeSpin(zero);
  };

  const presets = [
    { labelFa: 'وسط (ساده)', labelEn: 'Center', val: { x: 0, y: 0 } },
    { labelFa: 'تاپ‌اسپین (حرکت رو به جلو)', labelEn: 'Top Follow', val: { x: 0, y: -0.75 } },
    { labelFa: 'بک‌اسپین (بازگشت به عقب)', labelEn: 'Back Screw', val: { x: 0, y: 0.75 } },
    { labelFa: 'ساید چپ', labelEn: 'Left English', val: { x: -0.75, y: 0 } },
    { labelFa: 'ساید راست', labelEn: 'Right English', val: { x: 0.75, y: 0 } },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[75] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-xs bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-amber-500/30 rounded-3xl p-5 shadow-2xl text-center space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚪</span>
              <h3 className="text-sm font-black text-white">
                {isRtl ? 'تنظیم اِفه و پیچ توپ (Spin)' : 'Cue Ball Spin Control'}
              </h3>
            </div>
            <button
              onClick={() => { soundEngine?.playTap?.(); onClose(); }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            {isRtl ? 'با لمس و جابجایی نقطه قرمز، محل برخورد نوک چوب با توپ را مشخص کنید:' : 'Touch & drag the red contact point on the cue ball:'}
          </p>

          {/* Interactive Cue Ball Sphere */}
          <div className="relative flex items-center justify-center py-2">
            <div
              ref={containerRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                handlePointer(e);
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) handlePointer(e);
              }}
              className="w-44 h-44 rounded-full shadow-2xl relative cursor-crosshair touch-none select-none flex items-center justify-center border-4 border-slate-700/80"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #f8fafc 40%, #cbd5e1 75%, #64748b 100%)',
                boxShadow: '0 20px 35px -10px rgba(0,0,0,0.8), inset -8px -8px 20px rgba(0,0,0,0.35), inset 8px 8px 20px rgba(255,255,255,0.9)'
              }}
            >
              {/* Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <div className="w-full h-px bg-slate-800" />
                <div className="absolute h-full w-px bg-slate-800" />
              </div>

              {/* Labels around cue ball */}
              <span className="absolute top-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">
                {isRtl ? 'تاپ (Follow)' : 'Top'}
              </span>
              <span className="absolute bottom-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">
                {isRtl ? 'بک (Screw)' : 'Back'}
              </span>
              <span className="absolute left-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">
                {isRtl ? 'چپ' : 'Left'}
              </span>
              <span className="absolute right-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest pointer-events-none">
                {isRtl ? 'راست' : 'Right'}
              </span>

              {/* Draggable Red Contact Point */}
              <div
                className="absolute w-6 h-6 rounded-full bg-rose-600 border-2 border-white shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 flex items-center justify-center"
                style={{
                  left: `${50 + localSpin.x * 42}%`,
                  top: `${50 + localSpin.y * 42}%`,
                  boxShadow: '0 0 12px rgba(225, 29, 72, 0.8)'
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {presets.slice(1).map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundEngine?.playTap?.();
                  setLocalSpin(p.val);
                  onChangeSpin(p.val);
                }}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 transition-colors"
              >
                {isRtl ? p.labelFa : p.labelEn}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleReset}
              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs flex items-center justify-center gap-1"
            >
              <RotateCcw size={13} />
              <span>{isRtl ? 'ریست وسط' : 'Reset'}</span>
            </button>
            <button
              onClick={() => {
                soundEngine?.playTap?.();
                haptics?.success?.();
                onClose();
              }}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Check size={14} />
              <span>{isRtl ? 'تأیید' : 'Confirm'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
