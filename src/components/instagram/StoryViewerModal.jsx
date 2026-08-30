import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Send, ChevronRight, ChevronLeft, Sparkles, Volume2, VolumeX } from 'lucide-react';
import useAppStore from '../../store/appStore';
import SafeImage from '../ui/SafeImage';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';

export default function StoryViewerModal({ stories = [], initialIndex = 0, isOpen, onClose }) {
  const { language, userProfile } = useAppStore();
  const isRtl = language === 'fa';

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const activeStory = stories[currentIndex] || stories[0];

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsLiked(false);
  }, [initialIndex, isOpen]);

  // Story Auto-progress Timer
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + 2; // ~5 seconds per story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, isPaused, stories.length]);

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setIsLiked(false);
      haptics.tap?.();
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setIsLiked(false);
      haptics.tap?.();
    }
  };

  const handleLike = () => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 1200);
    }
  };

  const handleSendReply = (e) => {
    e?.preventDefault();
    if (!replyText.trim()) return;
    haptics.success?.();
    soundEngine.playCheckmark?.();
    setReplyText('');
    alert(isRtl ? 'پاسخ شما به استوری ارسال شد! ✨' : 'Reply sent to story!');
  };

  if (!isOpen || !activeStory) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="w-full h-full max-w-md bg-zinc-950 relative flex flex-col justify-between overflow-hidden shadow-2xl">
        
        {/* Story Progress Bars */}
        <div className="absolute top-2 inset-x-0 z-30 px-3 flex gap-1.5">
          {stories.map((s, idx) => (
            <div key={s.id || idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                style={{
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="absolute top-5 inset-x-0 z-30 px-4 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/40 p-0.5">
              <SafeImage 
                src={activeStory.avatar} 
                alt={activeStory.username} 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm drop-shadow-md">
                {activeStory.username}
              </span>
              <span className="text-[10px] text-white/70 font-mono">
                {activeStory.time || '2h'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 active:scale-95 transition-transform"
          >
            <X size={18} />
          </button>
        </div>

        {/* Story Background Visual */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <SafeImage 
            src={activeStory.storyImage || activeStory.avatar}
            alt={activeStory.username}
            className="w-full h-full object-cover"
            fallbackText={activeStory.title || 'Life OS Story'}
          />

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />

          {/* Story Text / Quote Overlay */}
          <div className="absolute inset-x-0 bottom-24 p-6 text-center text-white z-20">
            <div className="inline-block p-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 mb-3 text-2xl">
              {activeStory.icon || '🌌'}
            </div>
            <h3 className="text-base sm:text-lg font-black leading-relaxed drop-shadow-lg max-w-xs mx-auto">
              «{activeStory.quote || 'هر روز فرصتی بی‌همتا برای ساختن والاترین نسخه از خودت است.'}»
            </h3>
            {activeStory.tag && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-purple-600/60 backdrop-blur-md text-xs font-bold text-purple-200 border border-purple-400/30">
                #{activeStory.tag}
              </span>
            )}
          </div>
        </div>

        {/* Tap Navigators (Left & Right Invisible click areas) */}
        <div className="absolute inset-y-16 inset-x-0 z-20 flex">
          <div 
            onClick={isRtl ? handleNextStory : handlePrevStory} 
            className="w-1/3 h-full cursor-pointer" 
          />
          <div 
            onClick={isRtl ? handlePrevStory : handleNextStory} 
            className="w-2/3 h-full cursor-pointer" 
          />
        </div>

        {/* Floating Animated Heart Reaction */}
        <AnimatePresence>
          {showHeartBurst && (
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: [0, 1.4, 1.2], opacity: [0, 1, 1], y: 0 }}
              exit={{ scale: 1.8, opacity: 0, y: -100 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
            >
              <Heart size={110} className="fill-rose-500 text-rose-500 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Interactive Bar */}
        <div className="relative z-30 p-4 flex items-center gap-2 text-white">
          <form onSubmit={handleSendReply} className="flex-1 flex items-center bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
            <input 
              type="text" 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={isRtl ? `پاسخ به ${activeStory.username}...` : `Reply to ${activeStory.username}...`}
              className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-white placeholder-white/60"
              dir={isRtl ? 'rtl' : 'ltr'}
            />
            {replyText && (
              <button type="submit" className="text-white hover:text-purple-300">
                <Send size={16} />
              </button>
            )}
          </form>

          <button 
            onClick={handleLike}
            className="p-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white active:scale-90 transition-transform"
          >
            <Heart size={20} className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'} />
          </button>
        </div>

      </div>
    </div>
  );
}
