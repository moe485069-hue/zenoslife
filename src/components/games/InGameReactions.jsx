import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import realtimeNetwork from '../../services/realtimeNetwork';
import useAppStore from '../../store/appStore';
import { triggerTelegramHaptic } from '../../utils/telegram';

// Reaction Items Configuration
export const REACTION_ITEMS = [
  { id: 'tomato', icon: '🍅', nameFa: 'گوجه', sound: 'splat', color: '#ef4444' },
  { id: 'water', icon: '💧', nameFa: 'آب‌پاش', sound: 'splash', color: '#06b6d4' },
  { id: 'rose', icon: '🌹', nameFa: 'گل رز', sound: 'rose', color: '#f43f5e' },
  { id: 'bomb', icon: '💣', nameFa: 'بمب', sound: 'bomb', color: '#eab308' },
  { id: 'egg', icon: '🥚', nameFa: 'تخم‌مرغ', sound: 'egg', color: '#fef08a' },
  { id: 'applause', icon: '👏', nameFa: 'دستخوش', sound: 'cheer', color: '#10b981' },
];

// Offline Synthesized Audio Effects via Web Audio API
function playReactionSound(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'splat' || type === 'egg') {
      // Wet squishy splat sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'splash') {
      // Water splash white noise burst
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      whiteNoise.connect(filter);
      filter.connect(ctx.destination);
      whiteNoise.start(now);
    } else if (type === 'bomb') {
      // Low boom / explosion
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'rose') {
      // Harmonious chime
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.35);
      });
    } else if (type === 'cheer') {
      // Quick cheerful double blip
      [440, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    }
  } catch (_) {}
}

export default function InGameReactions({ roomId = 'GENERAL', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFlyingReactions, setActiveFlyingReactions] = useState([]);
  const [cooldown, setCooldown] = useState(false);
  const { userProfile } = useAppStore();

  const userId = useRef(
    localStorage.getItem('life_os_user_id') || 'user_' + Math.random().toString(36).substring(2, 8)
  ).current;

  // Listen to realtime network for reactions sent by anyone in this room
  useEffect(() => {
    const unsubscribe = realtimeNetwork.subscribe((data) => {
      if (data?.type === 'IN_GAME_REACTION' && (!roomId || data.roomId === roomId)) {
        triggerReactionVisual(data.reactionId, data.senderName, data.isSelf);
      }
    });
    return () => {
      unsubscribe?.();
    };
  }, [roomId]);

  const triggerReactionVisual = (reactionId, senderName, isSelf) => {
    const item = REACTION_ITEMS.find((r) => r.id === reactionId) || REACTION_ITEMS[0];
    playReactionSound(item.sound);
    triggerTelegramHaptic(item.id === 'bomb' ? 'heavy' : 'medium');

    const newReaction = {
      uid: 'fx_' + Date.now() + '_' + Math.random(),
      item,
      senderName: senderName || 'حریف',
      startX: isSelf ? 20 : 80,
      targetX: isSelf ? 80 : 20,
      targetY: 30 + Math.random() * 35,
    };

    setActiveFlyingReactions((prev) => [...prev, newReaction]);

    // Auto cleanup after splat animation
    setTimeout(() => {
      setActiveFlyingReactions((prev) => prev.filter((r) => r.uid !== newReaction.uid));
    }, 2800);
  };

  const handleSendReaction = (item) => {
    if (cooldown) return;
    setCooldown(true);
    setIsOpen(false);
    setTimeout(() => setCooldown(false), 1500);

    const senderName = userProfile?.fullName || userProfile?.username || 'شما';

    // Broadcast reaction
    realtimeNetwork.publish({
      type: 'IN_GAME_REACTION',
      roomId,
      reactionId: item.id,
      senderId: userId,
      senderName,
      timestamp: Date.now(),
    });

    // Also trigger locally
    triggerReactionVisual(item.id, senderName, true);
  };

  return (
    <>
      {/* 1. Fullscreen Visual Overlay for Flying Items & Splats */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <AnimatePresence>
          {activeFlyingReactions.map((r) => (
            <React.Fragment key={r.uid}>
              {/* Flying projectile */}
              <motion.div
                initial={{
                  opacity: 1,
                  scale: 0.5,
                  left: `${r.startX}%`,
                  top: '85%',
                  rotate: 0,
                }}
                animate={{
                  scale: [0.5, 1.4, 1.2],
                  left: `${r.targetX}%`,
                  top: `${r.targetY}%`,
                  rotate: 360,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute text-4xl sm:text-5xl drop-shadow-2xl"
              >
                {r.item.icon}
              </motion.div>

              {/* Splat / Impact Effect at target */}
              <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.2, 1.8, 1.6, 1.4],
                }}
                transition={{ delay: 0.45, duration: 2.2, times: [0, 0.15, 0.8, 1] }}
                style={{
                  left: `calc(${r.targetX}% - 45px)`,
                  top: `calc(${r.targetY}% - 45px)`,
                }}
                className="absolute flex flex-col items-center justify-center pointer-events-none"
              >
                {r.item.id === 'tomato' && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-red-600/70 blur-md animate-pulse" />
                    <span className="absolute text-6xl">💥🍅</span>
                  </div>
                )}
                {r.item.id === 'water' && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-cyan-400/60 blur-lg" />
                    <span className="absolute text-6xl">💦💧</span>
                  </div>
                )}
                {r.item.id === 'bomb' && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-amber-500/70 blur-xl animate-ping" />
                    <span className="absolute text-6xl">💥💣🔥</span>
                  </div>
                )}
                {r.item.id === 'rose' && (
                  <div className="relative flex items-center justify-center">
                    <span className="text-6xl filter drop-shadow-lg">🌹✨💖</span>
                  </div>
                )}
                {r.item.id === 'egg' && (
                  <div className="relative flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-yellow-400/50 blur-md" />
                    <span className="absolute text-6xl">🍳🥚</span>
                  </div>
                )}
                {r.item.id === 'applause' && (
                  <div className="relative flex items-center justify-center">
                    <span className="text-6xl animate-bounce">👏🎉⭐</span>
                  </div>
                )}
                <span className="mt-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white font-bold backdrop-blur-sm shadow">
                  از طرف {r.senderName}
                </span>
              </motion.div>
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. Floating Launcher Button & Menu */}
      <div className={`fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 ${className}`}>
        {/* Animated Tray */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              className="p-2 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center gap-2"
            >
              {REACTION_ITEMS.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.25 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSendReaction(item)}
                  title={item.nameFa}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex flex-col items-center justify-center text-xl transition-all shadow active:scale-90"
                >
                  <span>{item.icon}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-2xl transition-all border ${
            isOpen
              ? 'bg-amber-400 text-slate-950 border-amber-300 ring-4 ring-amber-400/30 rotate-12'
              : 'bg-[#1e1713]/90 text-white border-amber-500/40 hover:border-amber-400 backdrop-blur-md'
          }`}
        >
          {isOpen ? '✕' : '🍅'}
        </motion.button>
      </div>
    </>
  );
}
