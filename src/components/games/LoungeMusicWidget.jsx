import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Music, Radio, ChevronDown } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import useAppStore from '../../store/appStore';

const MUSIC_STATIONS = [
  { id: 'mystic_hang_drum', nameFa: '🪕 نواهای شرقی و سنتی', nameEn: 'Persian Mystique', desc: 'نواهای آرامش‌بخش هنگ‌درام و چوب' },
  { id: 'ambient_piano', nameFa: '☕ پیانو قهوه‌خانه آرامش', nameEn: 'Zen Lounge Piano', desc: 'ملودی‌های ملایم تمرکز و آرامش' },
  { id: 'desert_night', nameFa: '🌌 شب‌های کویر و فضا', nameEn: 'Desert Night Lofi', desc: 'هارمونی الکترونیک و باد شبانه' }
];

export default function LoungeMusicWidget() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(MUSIC_STATIONS[0]);
  const [showMenu, setShowMenu] = useState(false);

  // Stop music on unmount
  useEffect(() => {
    return () => {
      try {
        soundEngine.stopAllAmbientSounds?.();
      } catch (_) {}
    };
  }, []);

  const togglePlay = () => {
    try {
      if (isPlaying) {
        soundEngine.stopAllAmbientSounds?.();
        setIsPlaying(false);
        haptics.tap?.();
      } else {
        soundEngine.stopAllAmbientSounds?.();
        soundEngine.startAmbientSound?.(currentStation.id, 0.25);
        setIsPlaying(true);
        haptics.notification?.('success');
      }
    } catch (_) {}
  };

  const handleSelectStation = (st) => {
    setCurrentStation(st);
    setShowMenu(false);
    if (isPlaying) {
      soundEngine.stopAllAmbientSounds?.();
      soundEngine.startAmbientSound?.(st.id, 0.25);
    }
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Pill Music Bar */}
      <div className="flex items-center gap-1.5 p-1 px-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 backdrop-blur-md transition-all">
        {/* Animated Soundwave Indicator */}
        <button
          onClick={togglePlay}
          className="flex items-center gap-1 cursor-pointer group"
          title={isPlaying ? (isRtl ? 'توقف موسیقی' : 'Pause Music') : (isRtl ? 'پخش موسیقی لابی' : 'Play Music')}
        >
          <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            {isPlaying ? <Volume2 size={12} className="text-purple-400 animate-pulse" /> : <VolumeX size={12} className="text-slate-400" />}
          </div>

          <div className="flex items-end gap-0.5 h-3.5 px-0.5">
            {[0.4, 0.8, 0.5, 0.9, 0.3].map((h, i) => (
              <motion.div
                key={i}
                animate={isPlaying ? { height: ['20%', '100%', '30%'] } : { height: '25%' }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + i * 0.15,
                  ease: 'easeInOut'
                }}
                className={`w-0.5 rounded-full ${isPlaying ? 'bg-gradient-to-t from-purple-500 to-pink-400' : 'bg-slate-600'}`}
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>
        </button>

        {/* Station Name & Menu Trigger */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-1 text-[10px] font-black text-slate-300 hover:text-white transition-colors cursor-pointer pl-1 border-l border-white/10"
        >
          <span className="max-w-[100px] truncate">{isRtl ? currentStation.nameFa : currentStation.nameEn}</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Station Dropdown Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute top-full mt-2 right-0 z-50 w-52 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-2xl p-2 space-y-1 text-start"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="px-2 py-1 text-[9px] font-bold text-slate-400 border-b border-white/10">
              {isRtl ? 'ایستگاه‌های موسیقی زنده لابی' : 'Lounge Music Channels'}
            </div>

            {MUSIC_STATIONS.map((st) => {
              const isSelected = currentStation.id === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStation(st)}
                  className={`w-full p-2 rounded-xl text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="text-start">
                    <div className="text-[11px]">{isRtl ? st.nameFa : st.nameEn}</div>
                    <div className="text-[9px] text-slate-400 font-normal">{st.desc}</div>
                  </div>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
