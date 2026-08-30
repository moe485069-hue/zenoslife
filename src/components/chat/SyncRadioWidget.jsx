import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Volume2, VolumeX, Play, Pause, Disc3, Sparkles } from 'lucide-react';
import soundEngine from '../../utils/audio';

const CHANNELS = [
  { id: 'zen_ambient', name: 'فرکانس ۴۳۲ هرتز (آرامش و تمرکز)', icon: '🧘', color: 'from-emerald-500 to-teal-700' },
  { id: 'lofi_cafe', name: 'لوفای کافه‌ای و رادیو شب', icon: '☕', color: 'from-amber-500 to-orange-700' },
  { id: 'cyber_synth', name: 'سایبرپانک و الکترونیک کیهانی', icon: '🌌', color: 'from-purple-500 to-indigo-700' },
];

export default function SyncRadioWidget() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Web Audio Synth for ambient continuous sound
  const startAmbientSynth = (freq = 432) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      if (oscRef.current) {
        try { oscRef.current.stop(); } catch (_) {}
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Warm subtle modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.2;
      lfoGain.gain.value = 2;
      lfo.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume * 0.08, ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.warn('Audio synth failed:', e);
    }
  };

  const stopAmbientSynth = () => {
    if (gainRef.current && audioCtxRef.current) {
      try {
        gainRef.current.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.5);
        setTimeout(() => {
          if (oscRef.current) {
            try { oscRef.current.stop(); } catch (_) {}
            oscRef.current = null;
          }
        }, 500);
      } catch (_) {}
    }
  };

  const togglePlay = () => {
    soundEngine.playTap?.();
    if (isPlaying) {
      stopAmbientSynth();
      setIsPlaying(false);
    } else {
      const freq = activeChannel.id === 'zen_ambient' ? 432 : activeChannel.id === 'lofi_cafe' ? 320 : 528;
      startAmbientSynth(freq);
      setIsPlaying(true);
    }
  };

  const handleChannelSelect = (ch) => {
    setActiveChannel(ch);
    soundEngine.playTap?.();
    if (isPlaying) {
      const freq = ch.id === 'zen_ambient' ? 432 : ch.id === 'lofi_cafe' ? 320 : 528;
      startAmbientSynth(freq);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSynth();
    };
  }, []);

  return (
    <div className="mx-4 my-1.5 p-3 rounded-2xl bg-black/40 border border-purple-500/30 backdrop-blur-md flex items-center justify-between gap-3 text-right" dir="rtl">
      
      {/* Equalizer and Channel Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={togglePlay}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shadow-md active:scale-90 ${
            isPlaying ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30' : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Radio size={12} className={isPlaying ? 'text-green-400 animate-pulse' : 'text-slate-400'} />
            <span className="text-xs font-black text-white truncate">{activeChannel.name}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-bold">{isPlaying ? 'در حال پخش زنده 📻' : 'رادیو همگام چت‌روم'}</span>
            {isPlaying && (
              <div className="flex items-center gap-0.5 h-2.5">
                <span className="w-0.5 h-full bg-purple-400 animate-bounce rounded-full" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-full bg-pink-400 animate-bounce rounded-full" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-full bg-amber-400 animate-bounce rounded-full" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel Switchers */}
      <div className="flex items-center gap-1">
        {CHANNELS.map(ch => (
          <button
            key={ch.id}
            onClick={() => handleChannelSelect(ch)}
            title={ch.name}
            className={`p-1.5 rounded-xl border text-xs transition-all ${
              activeChannel.id === ch.id
                ? 'bg-purple-500/20 border-purple-400 text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{ch.icon}</span>
          </button>
        ))}
      </div>

    </div>
  );
}
