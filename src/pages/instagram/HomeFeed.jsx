import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/appStore';
import { db } from '../../db/database';
import StoryBar from '../../components/instagram/StoryBar';
import PostCard from '../../components/instagram/PostCard';
import CommentsModal from '../../components/instagram/CommentsModal';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';

export default function HomeFeed() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [posts, setPosts] = useState([]);
  const [activeCommentsPost, setActiveCommentsPost] = useState(null); // { postId, postTitle }
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [showRefreshToast, setShowRefreshToast] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const loadFeedPosts = async (shuffle = false) => {
    try {
      let items = await db.feedPosts.toArray();
      if (items.length === 0) {
        setTimeout(async () => {
          items = await db.feedPosts.toArray();
          setPosts(items);
        }, 400);
        return;
      }

      if (shuffle) {
        // Fetch pinned widgets so unpinned / fresh modules come first
        const pinned = await db.profileWidgets.toArray();
        const pinnedKeys = new Set(pinned.map(p => p.moduleKey));

        // Separate unpinned and pinned
        const unpinnedPosts = items.filter(p => !pinnedKeys.has(p.moduleKey));
        const pinnedPosts = items.filter(p => pinnedKeys.has(p.moduleKey));

        // Shuffle unpinned posts
        const shuffledUnpinned = [...unpinnedPosts].sort(() => Math.random() - 0.5);
        const shuffledPinned = [...pinnedPosts].sort(() => Math.random() - 0.5);

        setPosts([...shuffledUnpinned, ...shuffledPinned]);
      } else {
        setPosts(items);
      }
    } catch (e) {
      console.error('Error reading feed posts:', e);
    }
  };

  useEffect(() => {
    loadFeedPosts();
  }, []);

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    haptics.tap?.();
    soundEngine.playTap?.();
    
    await new Promise(res => setTimeout(res, 750));
    await loadFeedPosts(true);

    setIsRefreshing(false);
    setPullY(0);
    setShowRefreshToast(true);
    setTimeout(() => setShowRefreshToast(false), 2500);
  };

  // Touch Handlers for Pull to Refresh
  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPullingRef.current || window.scrollY > 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;
    if (deltaY > 0) {
      // Damped pull distance
      const distance = Math.min(90, deltaY * 0.45);
      setPullY(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    if (pullY > 55 && !isRefreshing) {
      triggerRefresh();
    } else {
      setPullY(0);
    }
  };

  return (
    <div 
      className="flex flex-col w-full min-h-screen bg-[var(--bg-card)] relative select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Instagram Pull-to-Refresh Spinner Indicator */}
      <div 
        className="w-full flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: `${isRefreshing ? 60 : pullY}px` }}
      >
        <div className="flex items-center justify-center p-2">
          <div className="w-9 h-9 rounded-full bg-[var(--bg-card)] border border-[var(--border)] shadow-md flex items-center justify-center">
            <svg 
              className={`w-5 h-5 text-purple-600 ${isRefreshing ? 'animate-spin' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              style={{ transform: `rotate(${pullY * 4}deg)` }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Top Refreshed Toast */}
      <AnimatePresence>
        {showRefreshToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-black/85 text-white text-xs font-bold shadow-xl flex items-center gap-2 backdrop-blur-md"
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{isRtl ? 'فید شما با ویژگی‌های جدید به‌روزرسانی شد ✨' : 'Feed refreshed with new realms ✨'}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Stories Navigation */}
      <StoryBar />

      {/* Shortcuts / Filter Chips */}
      <div className="px-3 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
        <button 
          onClick={() => triggerRefresh()}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-600/15 border border-purple-500/30 text-xs font-black text-purple-600 dark:text-purple-300 hover:bg-purple-600/25 shadow-xs active:scale-95 transition-all"
          title={isRtl ? 'رفرش فید' : 'Refresh Feed'}
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRtl ? 'به‌روزرسانی' : 'Refresh'}</span>
        </button>
        <button 
          onClick={() => navigate('/stroll')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shadow-xs active:scale-95 transition-all"
        >
          <span>🚶‍♂️</span>
          <span>{isRtl ? 'راهروها' : 'Realms'}</span>
        </button>
        <button 
          onClick={() => navigate('/games')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shadow-xs active:scale-95 transition-all"
        >
          <span>🎮</span>
          <span>{isRtl ? 'بازی‌ها' : 'Games'}</span>
        </button>
        <button 
          onClick={() => navigate('/my-day')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shadow-xs active:scale-95 transition-all"
        >
          <span>⚡</span>
          <span>{isRtl ? 'انجام کارها' : 'My Day'}</span>
        </button>
        <button 
          onClick={() => navigate('/ai-mentor')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shadow-xs active:scale-95 transition-all"
        >
          <Sparkles size={13} className="text-pink-500" />
          <span>{isRtl ? 'مربی هوشمند' : 'AI Mentor'}</span>
        </button>
      </div>

      {/* Main Post Feed */}
      <div className="flex flex-col w-full">
        {posts.map((post) => (
          <PostCard 
            key={post.id || post.postId} 
            post={post} 
            onOpenComments={(postId, postTitle) => setActiveCommentsPost({ postId, postTitle })}
          />
        ))}
      </div>

      {/* Real Comments Modal */}
      <CommentsModal 
        isOpen={!!activeCommentsPost}
        postId={activeCommentsPost?.postId}
        postTitle={activeCommentsPost?.postTitle}
        onClose={() => setActiveCommentsPost(null)}
      />
    </div>
  );
}
