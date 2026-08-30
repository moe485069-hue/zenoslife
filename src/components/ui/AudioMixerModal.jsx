import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Volume2, VolumeX, CloudRain, Waves, Trees, Wind, 
  Sparkles, Bell, Flame, Droplets, Music, Disc, Moon, 
  Radio, Play, Square, Zap, Sliders, Layers
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import useAppStore from '../../store/appStore';
import haptics from '../../utils/haptics';

const ALL_SOUND_TRACKS = [
  // INSTRUMENTS & MELODIES
  { id: 'piano', category: 'instruments', nameFa: 'پیانو آرام و لوفای', nameEn: 'Ambient Felt Piano', icon: Music, color: '#a855f7', descFa: 'ملودی پیانوی مینیمال و گرم' },
  { id: 'hangdrum', category: 'instruments', nameFa: 'هنگ‌درام و هندپن عرفانی', nameEn: 'Mystic Hang Drum', icon: Disc, color: '#f59e0b', descFa: 'نواهای ارتعاشی و عمیق گام کرد' },
  { id: 'guitar', category: 'instruments', nameFa: 'گیتار آکوستیک آرام', nameEn: 'Acoustic Guitar', icon: Music, color: '#38bdf8', descFa: 'آرپژهای گرم و گوش‌نواز سیم‌های نایلون' },
  { id: 'kalimba', category: 'instruments', nameFa: 'کالیمبا و زنگوله باد', nameEn: 'Kalimba & Chimes', icon: Sparkles, color: '#ec4899', descFa: 'ضربه‌های بلورین و آرامش‌بخش' },

  // NATURE & EARTH ELEMENTS
  { id: 'fire', category: 'nature', nameFa: 'آتش هیزمی و شومینه', nameEn: 'Crackling Fireplace', icon: Flame, color: '#f97316', descFa: 'شعله‌های گرم با ترق‌وتروق چوب' },
  { id: 'river', category: 'nature', nameFa: 'رودخانه و چشمه جاری', nameEn: 'Flowing River Stream', icon: Droplets, color: '#06b6d4', descFa: 'جریان زلال آب و حباب‌های کوهستانی' },
  { id: 'rain', category: 'nature', nameFa: 'باران ملایم و باران‌بار', nameEn: 'Gentle Rain', icon: CloudRain, color: '#38bdf8', descFa: 'ریزش یکنواخت قطرات باران' },
  { id: 'ocean', category: 'nature', nameFa: 'امواج اقیانوس آرام', nameEn: 'Ocean Waves', icon: Waves, color: '#0ea5e9', descFa: 'جزر و مد آرام ساحل شنی' },
  { id: 'forest', category: 'nature', nameFa: 'آوای جنگل و پرندگان', nameEn: 'Forest & Birds', icon: Trees, color: '#22c55e', descFa: 'آواز پرندگان صبحگاهی در بیشه‌زار' },
  { id: 'crickets', category: 'nature', nameFa: 'شب کویر و جیرجیرک‌ها', nameEn: 'Desert Night Crickets', icon: Moon, color: '#6366f1', descFa: 'سکون شبانگاهی زیر آسمان پرستاره' },
  { id: 'wind', category: 'nature', nameFa: 'نسیم و باد ملایم', nameEn: 'Calm Mountain Breeze', icon: Wind, color: '#8b5cf6', descFa: 'وزش باد در لابه‌لای درختان' },

  // FREQUENCIES & FOCUS
  { id: 'binaural', category: 'focus', nameFa: 'امواج آلفا ۴۳۲ هرتز', nameEn: '432Hz Alpha Waves', icon: Radio, color: '#eab308', descFa: 'فرکانس آرامش ذهنی و تمرکز خلاق' },
  { id: 'brown', category: 'focus', nameFa: 'نویز قهوه‌ای تمرکز عمیق', nameEn: 'Deep Brown Noise', icon: Zap, color: '#d97706', descFa: 'غرش عمیق برای حذف کامل نویز محیط' }
];

const PRESETS = [
  { id: 'hearth_piano', nameFa: 'شومینه و پیانو آرام', icon: '🎹🔥', tracks: { fire: 0.65, piano: 0.7 } },
  { id: 'river_guitar', nameFa: 'رودخانه و گیتار آکوستیک', icon: '🎸🌊', tracks: { river: 0.7, guitar: 0.65 } },
  { id: 'hang_alpha', nameFa: 'هنگ‌درام و امواج آلفا', icon: '🛸🧘', tracks: { hangdrum: 0.75, binaural: 0.5 } },
  { id: 'rain_chimes', nameFa: 'باران و کالیمبا', icon: '🌧️✨', tracks: { rain: 0.7, kalimba: 0.65 } },
  { id: 'deep_study', nameFa: 'تمرکز عمیق مطالعه', icon: '🎧⚡', tracks: { brown: 0.8, piano: 0.45 } }
];

export default function AudioMixerModal({ isOpen, onClose }) {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [activeCategory, setActiveCategory] = useState('all');
  const [volumes, setVolumes] = useState(() => {
    const initial = {};
    ALL_SOUND_TRACKS.forEach(t => { initial[t.id] = 0; });
    return initial;
  });

  const handleVolumeChange = (id, val) => {
    const newVol = parseFloat(val);
    setVolumes(prev => ({ ...prev, [id]: newVol }));
    soundEngine.setAmbientTrack(id, newVol);
  };

  const handleToggle = (id) => {
    const current = volumes[id] || 0;
    const nextVal = current > 0 ? 0 : 0.65;
    handleVolumeChange(id, nextVal);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const applyPreset = (preset) => {
    soundEngine.stopAllAmbient();
    const newVols = {};
    ALL_SOUND_TRACKS.forEach(t => { newVols[t.id] = 0; });
    
    Object.entries(preset.tracks).forEach(([trackId, vol]) => {
      newVols[trackId] = vol;
      soundEngine.setAmbientTrack(trackId, vol);
    });

    setVolumes(newVols);
    soundEngine.playLevelUp?.();
    haptics.success?.();
  };

  const stopAll = () => {
    soundEngine.stopAllAmbient();
    const reset = {};
    ALL_SOUND_TRACKS.forEach(t => { reset[t.id] = 0; });
    setVolumes(reset);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const activeCount = Object.values(volumes).filter(v => v > 0).length;

  const filteredTracks = ALL_SOUND_TRACKS.filter(t => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="glass-card w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl relative border border-[var(--border)] shadow-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div className="p-5 pb-3 border-b border-[var(--border)] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                <Volume2 size={22} className={activeCount > 0 ? 'animate-pulse' : ''} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  {isRtl ? 'استودیوی اصوات و سازهای آرام‌بخش' : 'Ambient & Instrument Soundscapes'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {activeCount > 0 
                    ? (isRtl ? `🎵 ${activeCount} صدا به طور همزمان در حال پخش است` : `🎵 ${activeCount} tracks active in mix`)
                    : (isRtl ? 'ترکیب دلخواه خود از طبیعت، پیانو و سازها را بسازید' : 'Create your custom soundscape mix')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tibetan Bowl Quick Chime */}
          <div className="px-5 pt-3 shrink-0">
            <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">🔔</span>
                <div>
                  <p className="text-xs font-black text-[var(--text-primary)]">
                    {isRtl ? 'نواختن زنگ کاسه تبتی ۵۲۸ هرتز' : '528Hz Tibetan Singing Bowl Chime'}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)]">
                    {isRtl ? 'فرکانس عشق، رهایی از تنش و وضوح ذهن' : 'Healing resonance single chime'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playMeditationBowl();
                  haptics.tap?.();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-black hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                {isRtl ? 'نواختن تک‌زنگ' : 'Ring Bowl'}
              </button>
            </div>
          </div>

          {/* Quick Presets Row */}
          <div className="px-5 pt-3 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] whitespace-nowrap pl-1">
                {isRtl ? 'ترکیب‌های آماده:' : 'Presets:'}
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-purple-600/15 border border-[var(--border)] hover:border-purple-500/40 text-xs font-bold text-[var(--text-primary)] whitespace-nowrap flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                >
                  <span>{p.icon}</span>
                  <span>{p.nameFa}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-5 pt-3 pb-2 shrink-0 flex gap-1.5 border-b border-[var(--border)] overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: isRtl ? 'همه اصوات (۱۳)' : 'All Sounds' },
              { id: 'instruments', label: isRtl ? '🎵 سازها و ملودی' : 'Instruments' },
              { id: 'nature', label: isRtl ? '🌿 طبیعت و عناصر' : 'Nature' },
              { id: 'focus', label: isRtl ? '🧘 تمرکز و فرکانس' : 'Focus & Alpha' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  soundEngine.playTap?.();
                  haptics.tap?.();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tracks List (Scrollable) */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 no-scrollbar">
            {filteredTracks.map(track => {
              const vol = volumes[track.id] || 0;
              const isPlaying = vol > 0;
              const IconComp = track.icon;

              return (
                <div
                  key={track.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isPlaying 
                      ? 'bg-purple-600/10 border-purple-500/50 shadow-md ring-1 ring-purple-500/30' 
                      : 'bg-[var(--bg-secondary)]/70 border-[var(--border)] hover:border-[var(--border)]/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(track.id)}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform active:scale-90 shadow-sm relative shrink-0"
                        style={{ backgroundColor: `${track.color}25`, color: track.color }}
                      >
                        <IconComp size={20} className={isPlaying ? 'animate-pulse' : ''} />
                        {isPlaying && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)] animate-ping" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                            {isRtl ? track.nameFa : track.nameEn}
                          </span>
                          {isPlaying && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-black border border-emerald-500/30">
                              {Math.round(vol * 100)}%
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                          {track.descFa}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(track.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isPlaying 
                          ? 'bg-purple-600 text-white shadow-xs' 
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {isPlaying ? (isRtl ? 'روشن' : 'Playing') : (isRtl ? 'خاموش' : 'Mute')}
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <VolumeX size={14} className="text-[var(--text-secondary)] opacity-60 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={vol}
                      onChange={(e) => handleVolumeChange(track.id, e.target.value)}
                      className="flex-1 h-2 rounded-lg appearance-none bg-[var(--border)] accent-purple-600 cursor-pointer"
                    />
                    <Volume2 size={14} className="text-[var(--text-secondary)] shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-[var(--border)] shrink-0 flex items-center justify-between gap-3 bg-[var(--bg-secondary)]/50">
            <button
              onClick={stopAll}
              disabled={activeCount === 0}
              className="py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <VolumeX size={15} />
              <span>{isRtl ? 'توقف همه اصوات' : 'Mute All'}</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
            >
              {isRtl ? 'بستن استودیو' : 'Close Studio'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
