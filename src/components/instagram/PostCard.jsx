import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/appStore';
import { db } from '../../db/database';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, PlusCircle, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';
import SafeImage from '../ui/SafeImage';

export default function PostCard({ post, onOpenComments }) {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isPinnedToProfile, setIsPinnedToProfile] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Sync initial state from DB
  useEffect(() => {
    let isMounted = true;
    const checkPostState = async () => {
      try {
        const username = isRtl ? 'کاربر_مدیر' : 'admin_user';
        const likeRecord = await db.postLikes.where({ postId: post.postId, username }).first();
        if (isMounted) setIsLiked(!!likeRecord);

        const pinnedRecord = await db.profileWidgets.where('moduleKey').equals(post.moduleKey || post.postId).first();
        if (isMounted) setIsPinnedToProfile(!!pinnedRecord);

        const count = await db.comments.where('postId').equals(post.postId).count();
        if (isMounted) setCommentsCount(count);
      } catch (e) {
        console.error('Error fetching post DB states:', e);
      }
    };
    checkPostState();
    return () => { isMounted = false; };
  }, [post.postId, post.moduleKey, isRtl]);

  const handleLike = async () => {
    haptics.tap?.();
    soundEngine.playTap?.();
    const username = isRtl ? 'کاربر_مدیر' : 'admin_user';
    
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
      await db.postLikes.where({ postId: post.postId, username }).delete();
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      await db.postLikes.add({ postId: post.postId, username, createdAt: new Date().toISOString() });
    }
  };

  const handleDoubleTap = async () => {
    setShowHeartAnim(true);
    haptics.tap?.();
    soundEngine.playTap?.();
    setTimeout(() => setShowHeartAnim(false), 900);

    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      const username = isRtl ? 'کاربر_مدیر' : 'admin_user';
      await db.postLikes.add({ postId: post.postId, username, createdAt: new Date().toISOString() });
    }
  };

  const handleTogglePinProfile = async (e) => {
    e?.stopPropagation();
    haptics.tap?.();
    soundEngine.playTap?.();
    try {
      const moduleKey = post.moduleKey || post.postId;
      if (isPinnedToProfile) {
        await db.profileWidgets.where('moduleKey').equals(moduleKey).delete();
        setIsPinnedToProfile(false);
      } else {
        await db.profileWidgets.add({
          moduleKey,
          titleFa: post.titleFa || post.widgetTitle,
          titleEn: post.titleEn || post.widgetTitle,
          descFa: post.descFa,
          descEn: post.descEn,
          icon: post.icon || '⚡',
          imageUrl: post.imageUrl,
          route: post.route || '/',
          color: post.color || '#8b5cf6',
          pinnedAt: new Date().toISOString()
        });
        setIsPinnedToProfile(true);
      }
    } catch (err) {
      console.error('Error toggling pin to profile:', err);
    }
  };

  const handleEnterModule = (e) => {
    e?.stopPropagation();
    haptics.tap?.();
    if (post.route) {
      navigate(post.route);
    }
  };

  const title = isRtl ? (post.titleFa || post.widgetTitle) : (post.titleEn || post.widgetTitle || post.titleFa);
  const desc = isRtl ? (post.descFa || post.widgetDesc) : (post.descEn || post.widgetDesc || post.descFa);

  return (
    <div className="w-full bg-[var(--bg-card)] border-b border-[var(--border)] pb-3 mb-4 shadow-xs">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleEnterModule}>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-white/20 shadow-md ring-2 ring-purple-500/30 overflow-hidden"
            style={{ backgroundColor: `${post.color || '#8b5cf6'}30` }}
          >
            {post.icon || '⚡'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-[var(--text-primary)]">{title}</span>
              <span className="text-blue-500 text-xs font-bold">✔</span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium block">
              {post.category || 'Life OS Official'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {post.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
              {post.badge}
            </span>
          )}
          <button className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Post Content Interactive Photo Card */}
      <div 
        className="w-full aspect-[4/3] sm:aspect-square relative cursor-pointer select-none overflow-hidden group"
        onDoubleClick={handleDoubleTap}
      >
        {/* Rich Background Photo with SafeImage Fallback */}
        <SafeImage 
          src={post.imageUrl || 'https://images.unsplash.com/photo-1542314831-c53cd4b85aca?w=800&q=80'} 
          alt={title} 
          icon={post.icon || '✨'}
          fallbackText={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

        {/* Floating Heart on Double Tap */}
        <AnimatePresence>
          {showHeartAnim && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 1] }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart size={95} className="fill-white text-rose-500 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Content inside Visual Card */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end text-white z-10">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-lg backdrop-blur-md border border-white/20 shadow-lg"
              style={{ backgroundColor: `${post.color || '#8b5cf6'}80` }}
            >
              {post.icon || '🌱'}
            </div>
            <h3 className="text-lg sm:text-xl font-black drop-shadow-md">
              {title}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed drop-shadow-sm mb-4">
            {desc}
          </p>

          {/* Action Buttons inside Card */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={handleEnterModule}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-black hover:bg-gray-100 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all"
            >
              <span>{isRtl ? 'ورود به بخش' : 'Enter Realm'}</span>
              <ArrowUpRight size={15} />
            </button>

            <button 
              onClick={handleTogglePinProfile}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-black backdrop-blur-md border transition-all active:scale-95 shadow-lg ${
                isPinnedToProfile 
                  ? 'bg-emerald-500/80 border-emerald-400 text-white' 
                  : 'bg-black/40 border-white/30 text-white hover:bg-black/60'
              }`}
            >
              {isPinnedToProfile ? <CheckCircle2 size={15} /> : <PlusCircle size={15} />}
              <span>{isPinnedToProfile ? (isRtl ? 'در پروفایل' : 'Pinned') : (isRtl ? 'افزودن به پروفایل' : 'Pin to Profile')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Post Actions (Likes, Comments, Share, Bookmark) */}
      <div className="flex flex-col px-3.5 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="transition-transform active:scale-75">
              <Heart size={24} className={isLiked ? 'fill-rose-500 text-rose-500' : 'text-[var(--text-primary)]'} />
            </button>
            <button 
              onClick={() => onOpenComments?.(post.postId, title)}
              className="transition-transform active:scale-75 text-[var(--text-primary)] flex items-center gap-1 hover:text-purple-500"
            >
              <MessageCircle size={24} />
            </button>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title, text: desc, url: window.location.href });
                } else {
                  navigator.clipboard?.writeText(window.location.origin + (post.route || ''));
                  alert(isRtl ? 'لینک کپی شد!' : 'Link copied!');
                }
              }}
              className="transition-transform active:scale-75 text-[var(--text-primary)] hover:text-purple-500"
            >
              <Send size={24} />
            </button>
          </div>

          <button onClick={() => setIsSaved(!isSaved)} className="transition-transform active:scale-75">
            <Bookmark size={24} className={isSaved ? 'fill-[var(--text-primary)] text-[var(--text-primary)]' : 'text-[var(--text-primary)]'} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="text-sm font-bold text-[var(--text-primary)] mb-1">
          {likesCount.toLocaleString()} {isRtl ? 'لایک' : 'likes'}
        </div>

        {/* Caption */}
        <div className="text-sm text-[var(--text-primary)] mb-1.5 leading-snug">
          <span className="font-bold mr-1.5" dir="ltr">life_os</span>
          <span>{desc}</span>
        </div>

        {/* Comments Link */}
        <button 
          onClick={() => onOpenComments?.(post.postId, title)}
          className="text-start text-xs text-[var(--text-secondary)] cursor-pointer mb-1 hover:text-purple-500 font-medium transition-colors"
        >
          {commentsCount > 0 
            ? (isRtl ? `مشاهده همه ${commentsCount} نظر...` : `View all ${commentsCount} comments...`)
            : (isRtl ? 'نوشتن اولین نظر برای این بخش...' : 'Add a comment...')}
        </button>

        {/* Timestamp */}
        <div className="text-[10px] text-[var(--text-secondary)] uppercase">
          {isRtl ? 'رسمی Life OS' : 'Official Life OS Realm'}
        </div>
      </div>
    </div>
  );
}
