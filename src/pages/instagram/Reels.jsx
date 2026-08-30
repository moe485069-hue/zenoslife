import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/appStore';
import SafeImage from '../../components/ui/SafeImage';
import { Heart, MessageCircle, Send, MoreHorizontal, Music, Volume2, VolumeX, Play } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';

const DUMMY_REELS = [
  {
    id: 1,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
    poster: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    username: 'nature_zen',
    avatar: 'https://i.pravatar.cc/150?img=12',
    caption: 'آرامش طبیعت و تنفس آگاهانه در دل جنگل 🌿 #طبیعت #مدیتیشن #لایف_اواس',
    likes: '14.2K',
    comments: '342',
    song: 'صدای آرامش‌بخش باد و باران 🎵'
  },
  {
    id: 2,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4',
    poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80',
    username: 'cosmic_journey',
    avatar: 'https://i.pravatar.cc/150?img=60',
    caption: 'غروب بی‌پایان در بلندای قله‌ها؛ پیوند روح با وسعت گیتی 🌌 #کیهان #استمرار',
    likes: '28.9K',
    comments: '890',
    song: 'موسیقی فرکانس تمرکز ۵۲۸ هرتز ✨'
  },
  {
    id: 3,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-green-screen-41712-large.mp4',
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    username: 'tech_master',
    avatar: 'https://i.pravatar.cc/150?img=14',
    caption: 'مدیریت زندگی با سیستم عامل شخصی 💻 #تمرکز #پومودورو #آرکید',
    likes: '9.4K',
    comments: '210',
    song: 'Lo-fi Chill Coding Beats 🎧'
  }
];

export default function Reels() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [activeReel, setActiveReel] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [showHeart, setShowHeart] = useState(false);

  const handleLike = (reelId) => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setLikedReels(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  };

  const handleDoubleTap = (reelId) => {
    if (!likedReels[reelId]) {
      handleLike(reelId);
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 900);
  };

  return (
    <div className="w-full h-[calc(100vh-4.5rem)] bg-black text-white relative overflow-hidden select-none">
      
      {/* Top Floating Header */}
      <div className="absolute top-0 inset-x-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent">
        <h1 className="text-lg sm:text-xl font-black italic tracking-wider bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {isRtl ? 'ریلز زندگی' : 'Life Reels'}
        </h1>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 active:scale-95"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>

      {/* Snap Scroll Reels List */}
      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {DUMMY_REELS.map((reel, index) => {
          const isCurrent = index === activeReel;
          const isLiked = likedReels[reel.id];

          return (
            <div 
              key={reel.id} 
              onDoubleClick={() => handleDoubleTap(reel.id)}
              className="w-full h-full snap-start relative bg-zinc-950 flex items-center justify-center overflow-hidden"
            >
              {/* Video with fallback poster */}
              <video 
                src={reel.url} 
                poster={reel.poster}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                autoPlay
                playsInline
              />

              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

              {/* Double Tap Heart Burst */}
              <AnimatePresence>
                {showHeart && isCurrent && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                  >
                    <Heart size={100} className="fill-rose-500 text-rose-500 drop-shadow-2xl animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right Floating Actions */}
              <div className="absolute right-3.5 bottom-16 flex flex-col items-center gap-5 z-20">
                
                {/* Like */}
                <button 
                  onClick={() => handleLike(reel.id)}
                  className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                >
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                    <Heart size={24} className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'} />
                  </div>
                  <span className="text-[11px] font-bold drop-shadow-md">{reel.likes}</span>
                </button>

                {/* Comments */}
                <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                    <MessageCircle size={24} />
                  </div>
                  <span className="text-[11px] font-bold drop-shadow-md">{reel.comments}</span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
                  <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                    <Send size={22} />
                  </div>
                </button>

                {/* More */}
                <button className="p-2 rounded-full bg-black/30 backdrop-blur-md text-white/80">
                  <MoreHorizontal size={20} />
                </button>

                {/* Spinning Music Disc */}
                <div className="w-9 h-9 rounded-full border-2 border-white/60 p-0.5 overflow-hidden animate-spin [animation-duration:6s] mt-1 shadow-lg">
                  <SafeImage src={reel.avatar} alt="music" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>

              {/* Bottom Caption & User Info */}
              <div className="absolute inset-x-0 bottom-4 p-4 pr-16 z-20 text-white flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full border-2 border-white/40 overflow-hidden shadow-md">
                    <SafeImage src={reel.avatar} alt={reel.username} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-black text-xs sm:text-sm drop-shadow-md">@{reel.username}</span>
                  <button className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-[10px] active:scale-95 transition-transform">
                    {isRtl ? 'دنبال کردن' : 'Follow'}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed drop-shadow-md font-medium">
                  {reel.caption}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-gray-300">
                  <Music size={12} className="animate-bounce" />
                  <span className="truncate">{reel.song}</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
